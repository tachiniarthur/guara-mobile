import {
  addDecimals,
  cents,
  divideCentsByDecimal,
  multiplyCentsByDecimal,
  sumCents,
} from '@guara/utils';

import { monthOf } from '../clock';
import type { MockDb, PositionRecord, PriceAlertRecord } from '../db';
import { mockError, notFound } from '../errors';
import {
  indicatorsOf,
  pointsToDecimal,
  quantityHeld,
  sampleHistory,
  userIncomeOf,
} from '../logic/market';
import {
  allocationOf,
  evolutionOf,
  exposureOf,
  positionsWithShares,
  propertyTotals,
  wealthOverviewOf,
} from '../logic/portfolio';
import { nextId, normalize, nowIso, touch } from '../logic/records';
import { today } from '../logic/spending';
import { seedFrom } from '../random';

import type { MockHandlers } from './types';

function findAsset(db: MockDb, ticker: string) {
  const asset = db.assets.find((item) => item.quote.ticker === ticker);
  if (!asset) throw notFound('Ativo não encontrado.');
  return asset;
}

function findDuplicate(db: MockDb, id: string) {
  const duplicate = db.duplicates.find((item) => item.id === id);
  if (!duplicate) throw notFound('Duplicidade não encontrada.');
  return duplicate;
}

function duplicateView(db: MockDb, record: MockDb['duplicates'][number]) {
  const live = positionsWithShares(db);
  const positions =
    record.snapshot ??
    record.positionIds.map((id) => {
      const position = live.find((item) => item.id === id);
      if (!position) throw notFound('Posição não encontrada.');
      return position;
    });
  const [first, second] = positions;
  if (!first || !second) throw notFound('Posição não encontrada.');
  const { snapshot: _snapshot, positionIds: _ids, ...rest } = record;
  return { ...rest, positions: [first, second] as [typeof first, typeof second] };
}

function alertView(db: MockDb, record: PriceAlertRecord) {
  const asset = findAsset(db, record.ticker);
  return { ...record, assetName: asset.quote.name, currentPrice: asset.quote.price };
}

function findAlert(db: MockDb, id: string) {
  const alert = db.priceAlerts.find((item) => item.id === id);
  if (!alert) throw notFound('Alerta de preço não encontrado.');
  return alert;
}

function findProperty(db: MockDb, id: string) {
  const property = db.properties.find((item) => item.id === id);
  if (!property) throw notFound('Bem não encontrado.');
  return property;
}

export const investmentHandlers = {
  'wealth.overview': (_request, { db }) => wealthOverviewOf(db),

  'wealth.evolution': ({ query }, { db }) => evolutionOf(db, query.range),

  'positions.list': ({ query }, { db }) => {
    const items = positionsWithShares(db, query.class);
    return { items, total: sumCents(items.map((item) => cents(item.currentValue ?? 0))) };
  },

  'positions.createManual': ({ body }, { db }) => {
    const ticker = body.instrument.ticker;
    const asset = ticker ? db.assets.find((item) => item.quote.ticker === ticker) : undefined;
    const priced = asset?.quote.price != null && body.quantity !== null;
    const createdAt = touch(db);
    const record: PositionRecord = {
      id: nextId(db, 'pos'),
      class: body.class,
      instrument: body.instrument,
      risk: body.risk,
      quantity: body.quantity,
      averagePrice: body.averagePrice,
      investedAmount: body.investedAmount,
      currentValue:
        body.currentValue ??
        (priced
          ? multiplyCentsByDecimal(cents(asset!.quote.price!), body.quantity!)
          : body.investedAmount),
      origin: 'manual',
      country: body.country,
      institutionName: null,
      connectionId: null,
      valueUpdatedAt: priced ? asset!.quote.quotedAt : createdAt,
      createdAt,
      updatedAt: createdAt,
    };
    const twin = ticker
      ? db.positions.find((item) => item.instrument.ticker === ticker)
      : undefined;
    db.positions.push(record);
    if (twin) {
      db.duplicates.push({
        id: nextId(db, 'dup'),
        positionIds: [twin.id, record.id],
        status: 'pending',
        resolution: null,
        detectedAt: createdAt,
        resolvedAt: null,
        snapshot: null,
      });
    }
    return {
      ...record,
      portfolioPercent: positionsWithShares(db).find((p) => p.id === record.id)!.portfolioPercent,
    };
  },

  'positions.delete': ({ params }, { db }) => {
    const position = db.positions.find((item) => item.id === params.positionId);
    if (!position) throw notFound('Posição não encontrada.');
    if (position.origin !== 'manual') {
      throw mockError('forbidden', 'Posições do Open Finance não podem ser excluídas.');
    }
    db.positions = db.positions.filter((item) => item.id !== position.id);
    touch(db);
  },

  'allocation.get': (_request, { db }) => allocationOf(db),

  'exposure.get': (_request, { db }) => exposureOf(db),

  'duplicates.list': (_request, { db }) =>
    [...db.duplicates]
      .sort((a, b) => Number(a.status === 'resolved') - Number(b.status === 'resolved'))
      .map((record) => duplicateView(db, record)),

  'duplicates.get': ({ params }, { db }) =>
    duplicateView(db, findDuplicate(db, params.duplicateId)),

  'duplicates.resolve': ({ params, body }, { db }) => {
    const record = findDuplicate(db, params.duplicateId);
    if (record.status === 'resolved')
      throw mockError('conflict', 'Esta duplicidade já foi resolvida.');
    const live = positionsWithShares(db);
    const pair = record.positionIds.map((id) => {
      const position = live.find((item) => item.id === id);
      if (!position) throw notFound('Posição não encontrada.');
      return position;
    });
    record.snapshot = pair;

    if (body.resolution === 'delete_one') {
      if (!record.positionIds.includes(body.deletePositionId)) {
        throw mockError('validation_failed', 'A posição a excluir precisa ser uma das duplicadas.');
      }
      db.positions = db.positions.filter((item) => item.id !== body.deletePositionId);
    }
    if (body.resolution === 'sum') {
      // Keeps the Open Finance position (when there is one) and folds the other into it.
      const [keep, drop] = [...pair].sort(
        (a, b) => Number(a.origin === 'manual') - Number(b.origin === 'manual'),
      );
      if (!keep || !drop) throw notFound('Posição não encontrada.');
      const target = db.positions.find((item) => item.id === keep.id)!;
      const quantity =
        keep.quantity && drop.quantity ? addDecimals(keep.quantity, drop.quantity) : null;
      const invested = sumCents([cents(keep.investedAmount ?? 0), cents(drop.investedAmount ?? 0)]);
      target.quantity = quantity;
      target.investedAmount = invested;
      target.currentValue = sumCents([
        cents(keep.currentValue ?? 0),
        cents(drop.currentValue ?? 0),
      ]);
      target.averagePrice = quantity ? divideCentsByDecimal(invested, quantity) : null;
      target.updatedAt = nowIso(db);
      db.positions = db.positions.filter((item) => item.id !== drop.id);
    }
    record.status = 'resolved';
    record.resolution = body.resolution;
    record.resolvedAt = touch(db);
    return duplicateView(db, record);
  },

  'assets.search': ({ query }, { db }) => {
    const text = normalize(query.q);
    return db.assets
      .filter(
        (asset) =>
          (!query.type || asset.quote.type === query.type) &&
          (normalize(asset.quote.ticker).includes(text) ||
            normalize(asset.quote.name).includes(text)),
      )
      .slice(0, 10)
      .map((asset) => asset.quote);
  },

  'assets.get': ({ params }, { db }) => {
    const asset = findAsset(db, params.ticker);
    const todayDate = today(db);
    return {
      asset: asset.quote,
      indicators: indicatorsOf(asset),
      lastEarnings: asset.lastEarnings,
      dividends: [...asset.dividends].sort((a, b) => b.exDate.localeCompare(a.exDate)),
      events: asset.events,
      userIncome: userIncomeOf(db, asset, todayDate),
      userPositionIds: quantityHeld(db, params.ticker)
        ? db.positions
            .filter((item) => item.instrument.ticker === params.ticker)
            .map((item) => item.id)
        : [],
    };
  },

  'assets.history': ({ params, query }, { db }) => {
    const asset = findAsset(db, params.ticker);
    const isIndex = asset.quote.type === 'index';
    return {
      ticker: asset.quote.ticker,
      range: query.range,
      points: sampleHistory(asset, query.range, today(db)).map((point) => ({
        date: point.date,
        close: isIndex ? null : point.value,
        points: isIndex ? pointsToDecimal(point.value) : null,
      })),
    };
  },

  'properties.list': (_request, { db }) => {
    const totals = propertyTotals(db);
    return {
      items: db.properties,
      totalValue: totals.value,
      totalDebt: totals.debt,
      net: totals.net,
    };
  },

  'properties.get': ({ params }, { db }) => findProperty(db, params.propertyId),

  'properties.createRealEstate': ({ body }, { db }) => {
    const createdAt = touch(db);
    const property = {
      id: nextId(db, 'prop'),
      kind: 'real_estate' as const,
      ...body,
      createdAt,
      updatedAt: createdAt,
    };
    db.properties.push(property);
    return property;
  },

  'properties.createVehicle': ({ body }, { db }) => {
    const createdAt = touch(db);
    // FIPE value derived from the code, so the same code always gets the same value.
    const fipeValue = 3_000_000 + (seedFrom(body.fipeCode) % 120_000) * 100;
    const property = {
      id: nextId(db, 'prop'),
      kind: 'vehicle' as const,
      ...body,
      fipeValue,
      fipeReferenceMonth: monthOf(today(db)),
      createdAt,
      updatedAt: createdAt,
    };
    db.properties.push(property);
    return property;
  },

  'properties.delete': ({ params }, { db }) => {
    findProperty(db, params.propertyId);
    db.properties = db.properties.filter((item) => item.id !== params.propertyId);
    touch(db);
  },

  'priceAlerts.list': (_request, { db }) =>
    [...db.priceAlerts]
      .sort(
        (a, b) =>
          Number(a.status !== 'active') - Number(b.status !== 'active') ||
          b.createdAt.localeCompare(a.createdAt),
      )
      .map((record) => alertView(db, record)),

  'priceAlerts.get': ({ params }, { db }) => alertView(db, findAlert(db, params.alertId)),

  'priceAlerts.create': ({ body }, { db }) => {
    const asset = findAsset(db, body.ticker);
    if (asset.quote.price === null) {
      throw mockError('bad_request', 'Alertas de preço não valem para índices.');
    }
    const record: PriceAlertRecord = {
      id: nextId(db, 'alert'),
      ticker: body.ticker,
      side: body.side,
      targetPrice: body.targetPrice,
      status: 'active',
      createdAt: touch(db),
      triggeredAt: null,
      triggeredPrice: null,
    };
    db.priceAlerts.push(record);
    return alertView(db, record);
  },

  'priceAlerts.cancel': ({ params }, { db }) => {
    const record = findAlert(db, params.alertId);
    if (record.status !== 'active')
      throw mockError('conflict', 'Só alertas ativos podem ser cancelados.');
    record.status = 'cancelled';
    touch(db);
    return alertView(db, record);
  },
} satisfies Partial<MockHandlers<MockDb>>;
