import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePaymentIntent } from './payment.service';

test('detects lesson access payments from lesson-specific purposes', () => {
  const result = resolvePaymentIntent({ purpose: 'LESSON_ACCESS:lesson-123', lessonId: 'lesson-123' });

  assert.equal(result.isLessonPayment, true);
  assert.equal(result.requiresLessonId, true);
});

test('treats payments with a lesson id as lesson access purchases', () => {
  const result = resolvePaymentIntent({ lessonId: 'lesson-123' });

  assert.equal(result.isLessonPayment, true);
  assert.equal(result.requiresLessonId, true);
});
