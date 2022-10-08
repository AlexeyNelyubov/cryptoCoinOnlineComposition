

onmessage = (e) => {
    //console.log (e.data);
    if (e.data[1]){
        postMessage([e.data[0], true]);
    };
    if (!e.data[1]){
        postMessage([e.data[0], false]);
    };
} 




