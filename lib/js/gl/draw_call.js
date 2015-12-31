gb.DrawCall = function()
{
	this.depth_test = true;
	//this.camera;
	this.entities = [];
	this.material;
	this.target;
}
gb.PostCall = function()
{
	this.mesh;
	this.material;
	this.target;
}

gb.draw_call = 
{
	new: function(entities, material, target)
	{
		var r = new gb.DrawCall();
		//r.camera = camera;
		r.entities = entities;
		r.material = material;
		r.target = target;
		return r;
	},
}
gb.post_call = 
{
	new: function(material, target)
	{
		var r = new gb.PostCall();
		r.mesh = gb.mesh.quad(2,2);
		r.material = material;
		r.target = target;
		return r;
	},
}