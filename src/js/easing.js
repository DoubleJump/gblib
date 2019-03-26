function ease_in_quad(t) 
{ 
  return t*t;
}

function ease_out_quad(t) 
{ 
  return t*(2-t);
}

function ease_in_out_quad(t) 
{ 
  return t<.5 ? 2*t*t : -1+(4-2*t)*t;
}

function ease_in_cubic (t) 
{ 
  return t*t*t;
}

function ease_out_cubic (t) 
{ 
  return (--t)*t*t+1; 
}

function ease_in_out_cubic (t) 
{ 
  return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
}

function ease_in_quart (t) 
{ 
  return t*t*t*t;
}

function ease_out_quart (t) 
{ 
  return 1-(--t)*t*t*t; 
}
function ease_in_out_quart (t) 
{ 
  return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t;
}
function ease_in_quint (t) 
{ 
  return t*t*t*t*t;
};
function ease_out_quint (t) 
{ 
  return 1+(--t)*t*t*t*t; 
}
function ease_in_out_quint (t) 
{ 
  return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t;
}