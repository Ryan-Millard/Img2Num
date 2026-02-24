/**
 * loadItemsSequentially
 * @param {Array} items - items to fetch
 * @param {Function} fetchItem - async function(item) => data
 * @param {Function} onItem - optional callback called when each item resolves
 * @returns {Promise<Array>} - resolves when all items are loaded
 */
export async function loadItemsSequentially(items, fetchItem, onItem) {
  const results = [];
  for (const item of items) {
    const data = await fetchItem(item);
    results.push(data);
    if (onItem) onItem(data);
  }
  return results;
}

/**
 * Load items in parallel and call a callback as each item resolves
 * @param {Array} items
 * @param {Function} fetchItem async function(item) => data
 * @param {Function} onItem optional callback(data)
 * @returns {Promise<Array>} resolves when all items are loaded
 */
export function loadItemsParallel(items, fetchItem, onItem) {
  const promises = items.map(async (item) => {
    const data = await fetchItem(item);
    if (onItem) onItem(data);
    return data;
  });
  return Promise.all(promises);
}
