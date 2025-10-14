import { CryptoUtil } from './crypto.util';

describe('CryptoUtil - Method Existence', () => {
  it('should have generateUniqueSlug method', () => {
    expect(typeof CryptoUtil.generateUniqueSlug).toBe('function');
  });

  it('should generate slug from name', () => {
    const slug = CryptoUtil.generateSlug('Filipe Labs');
    expect(slug).toBe('filipe-labs');
  });

  it('should validate slug format', () => {
    expect(CryptoUtil.validateSlug('filipe-labs')).toBe(true);
    expect(CryptoUtil.validateSlug('1filipe-labs')).toBe(false);
    expect(CryptoUtil.validateSlug('filipe--labs')).toBe(false);
  });

  it('should generate unique slug', async () => {
    const checkExists = jest.fn().mockResolvedValue(false);
    const slug = await CryptoUtil.generateUniqueSlug('Test Platform', checkExists);
    expect(slug).toBe('test-platform');
    expect(checkExists).toHaveBeenCalledWith('test-platform');
  });
});
