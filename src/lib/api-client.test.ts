import { describe, it, expect } from 'vitest';
import { apiClient } from '../api-client';

describe('API Client', () => {
  it('should set tokens correctly', () => {
    const tokens = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    };

    apiClient.setTokens(tokens);

    expect(localStorage.getItem('accessToken')).toBe(tokens.accessToken);
    expect(localStorage.getItem('refreshToken')).toBe(tokens.refreshToken);
  });

  it('should clear tokens correctly', () => {
    apiClient.setTokens({
      accessToken: 'test',
      refreshToken: 'test',
    });

    apiClient.clearTokens();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
