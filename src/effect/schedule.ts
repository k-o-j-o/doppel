export const Schedule = {
    Sync: (callback) => void callback(),
    Queue: queueMicrotask
  };