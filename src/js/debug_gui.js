function Debug_Options()
{
    var r = {};

    var ops = 
    {
        ax: 1.0,
        ay: 0.50,
        bx: 1.0,
        by: 1.0,
        cx: 1.0,
        cy: 10.0,
        dx: 1.0,
        dy: 1.0,
    };

    var gui = new dat.GUI();
    gui.add(ops, 'ax', 0,1,0.001);
    gui.add(ops, 'ay', 0,1,0.001);
    gui.add(ops, 'bx', 0.0,1.0,0.01);
    gui.add(ops, 'by', 0.0,1.0,0.01);
    gui.add(ops, 'cx', 0.0,1.0,0.01);
    gui.add(ops, 'cy', 0.0,30.0,0.01);
    gui.add(ops, 'dx', 0.0,30.0,0.01);
    gui.add(ops, 'dy', 0.0,1.0,0.01);

    var cont = div('div', 'debug-options hidden');
    cont.appendChild(gui.domElement);
    document.body.appendChild(cont);

    r.options = ops;
    r.container = cont;
    return r;
}
