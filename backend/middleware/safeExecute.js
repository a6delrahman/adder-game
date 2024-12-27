async function safeExecute(fn, ...args) {
  try {
    return await fn(...args);
  } catch (error) {
    console.error(`Error during execution of ${fn.name}:`, error);
    throw error; // Optional: Weiterleitung an den Aufrufer
  }
}

module.exports = safeExecute;