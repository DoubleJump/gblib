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
	//TODO rig copy from src

	update: function(rig, scene)
	{
		var qt = gb.quat.tmp();

		var n = rig.joints.length;
		for(var i = 0; i < n; ++i)
		{
			var j = rig.joints[i];
			var r = j.rotation;
			qt[0] = r[0];
			qt[1] = r[2];
			qt[2] = -r[1];
			qt[3] = -r[3];

			gb.mat4.compose(j.local_matrix, j.position, j.scale, qt);
			if(j.parent === -1)
			{
				gb.mat4.mul(j.world_matrix, j.local_matrix, scene.world_matrix);
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
    	joint.inverse_bind_pose[12] = s.r_f32(br);
    	joint.inverse_bind_pose[13] = s.r_f32(br);
    	joint.inverse_bind_pose[14] = s.r_f32(br);
    	rig.joints.push(joint);
    } 

    return rig;
}