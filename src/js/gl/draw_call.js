gb.DrawCall = function()
{
	this.depth_test = true;
	this.camera;
	this.material;
	this.entities = [];
}
gb.PostCall = function()
{
	this.mesh;
	this.material;
}

gb.draw_call = 
{
	new: function(camera, material, entities)
	{
		var r = new gb.DrawCall();
		r.camera = camera;
		r.material = material;
		r.entities = entities;
		return r;
	},
}
gb.post_call = 
{
	new: function(shader, full_screen)
	{
		var r = new gb.PostCall();
		full_screen = full_screen || true;
		if(full_screen === true)
		{
			r.mesh = gb.mesh.generate.quad(2,2);
		}
		r.material = gb.material.new(shader);
		return r;
	},
}