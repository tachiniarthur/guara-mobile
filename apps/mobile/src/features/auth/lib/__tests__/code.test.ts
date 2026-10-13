import { attemptsText, countdown, isExpired, isValidEmail, onlyDigits } from '../code';

describe('e-mail code', () => {
  it('keeps six digits and counts down', () => {
    expect(onlyDigits('48 2-917 5')).toBe('482917');
    expect(countdown(45)).toBe('0:45');
    expect(countdown(60)).toBe('1:00');
    expect(countdown(-3)).toBe('0:00');
  });

  it('checks the e-mail, the age of the code and the tries left', () => {
    expect(isValidEmail('arthur@exemplo.com')).toBe(true);
    expect(isValidEmail('arthur@exemplo')).toBe(false);
    expect(isExpired(0, 10 * 60 * 1000)).toBe(false);
    expect(isExpired(0, 10 * 60 * 1000 + 1)).toBe(true);
    expect(attemptsText(4)).toBe('Restam 4 tentativas.');
    expect(attemptsText(1)).toBe('Resta 1 tentativa.');
  });
});
