export type AnyErr = {
  message: string;
};

const keyPriority = [
  'message',
  'messages',
  'error',
  'errors',
  'err',
  'detail',
  'details',
  'title',
  'data',
  'status',
  'code',
];

const findErrorMessage = (err: unknown, depth: number = 0): string | null => {
  if (depth > 10 || err === undefined || err === null) {
    return null;
  }

  if (typeof err === 'string' && err.length > 0) {
    return err;
  }

  // Axios
  if ((err as any)?.response) {
    const msg = findErrorMessage((err as any).response, depth + 1);
    if (msg !== null) return msg;
  }

  if (Array.isArray(err)) {
    for (const item of err) {
      const msg = findErrorMessage(item, depth + 1);
      if (msg !== null) return msg;
    }
  }

  if (typeof err === 'object') {
    for (const key of [...keyPriority, ...Object.keys(err)]) {
      if (key in err) {
        const msg = findErrorMessage((err as any)[key], depth + 1);
        if (msg !== null) {
          return msg;
        }
      }
    }
  }

  return null;
};

export function parseAnyError(err: unknown, fallback?: string): AnyErr {
  fallback ??= 'Unknown error';

  const msg = findErrorMessage(err);
  if (msg !== null) {
    return { message: msg };
  }

  return { message: fallback };
}
