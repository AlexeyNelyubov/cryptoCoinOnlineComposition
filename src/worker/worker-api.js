const allPorts = [];
self.onconnect = (e) => {
  const port = e.ports[0];
  allPorts.push(port);
  port.onmessage = function (ev) {
    if (ev.data[1]) {
      allPorts.map((instance) => {
        instance.postMessage([ev.data[0], true]);
      });
    }
    if (!ev.data[1]) {
      allPorts.map((instance) => {
        instance.postMessage([ev.data[0], false]);
      });
    }
  };
};
