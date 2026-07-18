import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLessonAccessMetadata, resolveLessonAccessState } from './lesson.service';

test('marks premium lessons as restricted for unauthenticated users', () => {
  const result = resolveLessonAccessState({ isPremium: true }, undefined, false);

  assert.equal(result.accessRestricted, true);
  assert.equal(result.canAccess, false);
});

test('marks premium lessons as accessible when user has access', () => {
  const result = resolveLessonAccessState({ isPremium: true }, 'user-1', true);

  assert.equal(result.accessRestricted, false);
  assert.equal(result.canAccess, true);
});

test('builds access metadata for premium lessons in list responses', () => {
  const result = buildLessonAccessMetadata({ isPremium: true }, 'user-1', true);

  assert.equal(result.accessRestricted, false);
  assert.equal(result.canAccess, true);
});
