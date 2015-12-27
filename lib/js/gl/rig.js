gb.Rig = function()
{
	this.joints;	
}
gb.Joint = function()
{
	this.parent;
	this.position;
	this.scale;
	this.rotation;
	this.local_matrix;
	this.world_matrix; 
	this.inverse_bind_pose;
	this.offset_matrix;
	this.bind_pose;
}

gb.rig = 
{
	MAX_JOINTS: 18,

	new: function()
	{
		var r = new gb.Rig();
		r.joints = [];
		return r;
	},
	copy: function(src)
	{
		var r = new gb.Rig();
		var m4 = gb.mat4;
		var v3 = gb.vec3;
		r.joints = [];
		var n = src.joints.length;
		for(var i = 0; i < n; ++i)
		{
			var sj = src.joints[i];
			var j = gb.rig.joint();
			j.parent = sj.parent;
			v3.eq(j.postition, sj.position);
			v3.eq(j.scale, sj.scale);
			gb.quat.eq(j.rotation, sj.rotation);
			m4.eq(j.local_matrix, sj.local_matrix);
			m4.eq(j.world_matrix, sj.world_matrix);
			m4.eq(j.bind_pose, sj.bind_pose);
			m4.eq(j.inverse_bind_pose, sj.inverse_bind_pose);
			m4.eq(j.offset_matrix, sj.offset_matrix);
			r.joints.push(j);
		}
		return r;
	},
	joint: function()
	{
		var j = new gb.Joint();
		j.parent = -1;
		j.position = gb.vec3.new();
		j.scale = gb.vec3.new(1,1,1);
		j.rotation = gb.quat.new();
		j.local_matrix = gb.mat4.new();
		j.world_matrix = gb.mat4.new(); 
		j.bind_pose = gb.mat4.new();
		j.inverse_bind_pose = gb.mat4.new();
		j.offset_matrix = gb.mat4.new();
		return j;
	},
	update: function(rig, scene)
	{
		var qt = gb.quat.tmp();

		var n = rig.joints.length;
		for(var i = 0; i < n; ++i)
		{
			var j = rig.joints[i];
			gb.mat4.compose(j.local_matrix, j.position, j.scale, j.rotation);
			gb.mat4.mul(j.local_matrix, j.local_matrix, j.bind_pose);
			if(j.parent === -1)
			{
				gb.mat4.eq(j.world_matrix, j.local_matrix);
			}
			else
			{
				var parent = rig.joints[j.parent];
				gb.mat4.mul(j.world_matrix, j.local_matrix, parent.world_matrix);
			}

			gb.mat4.mul(j.offset_matrix, j.inverse_bind_pose, j.world_matrix);
		}
	},
}
gb.binary_reader.rig = function(br, ag)
{
    var s = gb.binary_reader;
    var rig = gb.rig.new();
    rig.name = s.string(br);
    var num_joints = s.i32(br);
    ASSERT(num_joints <= gb.rig.MAX_JOINTS, "Rig has too many joints!");
    for(var i = 0; i < num_joints; ++i)
    {
    	var j = new gb.Joint();
		j.position = gb.vec3.new();
		j.scale = gb.vec3.new(1,1,1);
		j.rotation = gb.quat.new();
		j.local_matrix = gb.mat4.new();
		j.world_matrix = gb.mat4.new(); 
		j.offset_matrix = gb.mat4.new();
    	j.parent = s.i32(br);
    	j.bind_pose = s.mat4(br);
    	j.inverse_bind_pose = s.mat4(br);
    	rig.joints.push(j);
    } 
    return rig;
}