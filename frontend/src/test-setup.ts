import type { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

(globalThis as unknown as { expect: typeof expect }).expect.extend(matchers);
