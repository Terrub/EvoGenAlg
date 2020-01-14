function createMainloop(frameRender) {
    var proto_mainloop;
    var animating = false;

    function tic() {
        if (animating !== true) { return; }         
        
        frameRender();
        
        window.requestAnimationFrame(tic);
    }

    function start() {
        if (animating === true) { return; }
        animating = true;
        report("Animation started");
        tic();
    }

    function stop() {
        animating = false;
        report("Animation stopped");
    }

    function reset() {
    }

    if (!isFunction(frameRender)) {
        reportUsageError("Usage: createMainloop(frameRender: function");
    }

    proto_mainloop = {
        "start": start,
        "stop": stop,
        "reset": reset
    }

    return proto_mainloop;
}
