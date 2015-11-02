gb.Rig = function()
{
	this.joints = [];	
}
gb.Joint = function()
{
	this.parent = -1;
	this.position = gb.vec3.new();
	this.scale = gb.vec3.new(1,1,1);
	this.rotation = gb.quat.new();
	this.local_matrix = gb.mat4.new();
	this.world_matrix = gb.mat4.new(); 
	this.inverse_bind_pose = gb.mat4.new();
	this.offset_matrix = gb.mat4.new();
}

gb.rig = 
{
	update: function(rig)
	{
		var n = rig.joints.length;
		for(var i = 0; i < n; ++i)
		{
			var j = rig.joints[i];
			gb.mat4.compose(j.local_matrix, j.position, j.scale, j.rotation);
			if(j.parent !== -1)
			{
				var parent = rig.joints[j.parent];
				gb.mat4.mul(j.world_matrix, j.local_matrix, parent.world_matrix);
			}
			else
			{
				gb.mat4.eq(j.world_matrix, j.local_matrix);
			}
			
		}
		
		gb.mat4.mul(j.offset_matrix, j.world_matrix, j.inverse_bind_pose);
	},
}

gb.serialize.r_rig = function(br, ag)
{
    var s = gb.serialize;

    var rig = new gb.Rig();
    rig.name = s.r_string(br);
    var num_joints = s.r_i32(br);
    for(var i = 0; i < num_joints; ++i)
    {
    	var joint = new gb.Joint();
    	joint.parent = s.r_i32(br);
    	joint.position[0] = s.r_f32(br);
    	joint.position[1] = s.r_f32(br);
    	joint.position[2] = s.r_f32(br);
    	joint.scale[0] = s.r_f32(br);
    	joint.scale[1] = s.r_f32(br);
    	joint.scale[2] = s.r_f32(br);
    	joint.rotation[0] = s.r_f32(br);
    	joint.rotation[1] = s.r_f32(br);
    	joint.rotation[2] = s.r_f32(br);
    	joint.rotation[3] = s.r_f32(br);
    	for(var j = 0; j < 16; ++j)
    	{
    		joint.inverse_bind_pose[j] = s.r_f32(br);
    	}
    	rig.joints.push(joint);
    } 

    return rig;
}