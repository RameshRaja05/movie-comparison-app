export const debounce = (cb, delay=1000) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        cb.apply(null, args);
      }, delay);
    };
  };