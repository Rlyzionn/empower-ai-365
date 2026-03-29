// ============================================================
//  Global Error Handler
// ============================================================

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}`, err.message);

  // Supabase / PostgreSQL errors
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with these details already exists.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist.' });
  }

  // JSON parse errors (malformed request body)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }

  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * asyncHandler — wraps async route handlers so unhandled promise rejections
 * are passed to the error handler instead of crashing the process.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };
