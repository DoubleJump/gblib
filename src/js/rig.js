function Rig()
{
	var r = {};
	r.joints = [];
	r.composite = null;
	return r;	
}
function Joint()
{
	var r = {};
	r.parent = -1;
	r.position = Vec3();
	r.scale = Vec3(1,1,1);
	r.rotation = Vec4();
	r.local_matrix = Mat4();
	r.world_matrix = Mat4(); 
	r.bind_pose;// = Mat4();
	r.inverse_bind_pose;// = Mat4();
	r.offset_matrix = Mat4();
	return r;
}

function update_rig(rig)
{
	var n = rig.joints.length;
	var index = 0;
	for(var i = 0; i < n; ++i)
	{
		var j = rig.joints[i];
		mat4_compose(j.local_matrix, j.position, j.scale, j.rotation);
		mat4_mul(j.local_matrix, j.local_matrix, j.bind_pose);
		if(j.parent === -1)
		{
			vec_eq(j.world_matrix, j.local_matrix);
		}
		else
		{
			var parent = rig.joints[j.parent];
			mat4_mul(j.world_matrix, j.local_matrix, parent.world_matrix);
		}

		mat4_mul(j.offset_matrix, j.inverse_bind_pose, j.world_matrix);

		for(var k = 0; k < 16; ++k)
		{
			rig.composite[index + k] = j.offset_matrix[k];
		}
		index += 16;
	}
}

function read_rig(ag)
{
    var rig = Rig();
    rig.name = read_string();
    var num_joints = read_i32();
    ASSERT(num_joints <= 18, "Rig has too many joints!");
    rig.composite = new Float32Array(num_joints * 16);
    for(var i = 0; i < num_joints; ++i)
    {
    	var j = Joint();
    	j.parent = read_i32();
    	j.bind_pose = read_f32(16);
    	j.inverse_bind_pose = read_f32(16);
    	rig.joints.push(j);
    } 
	if(ag) ag.rigs[rig.name] = rig;
	return rig;
}

function read_rig_action(ag)
{
    var animation = Animation();
    animation.target_type = 2;
    animation.name = read_string();

    var num_curves = read_i32();
    for(var i = 0; i < num_curves; ++i)
    {
    	var tween = Tween();
    	tween.bone_index = read_i32();
    	tween.property = read_string();
    	tween.index = read_i32();

    	tween.num_frames = read_i32();
    	tween.curve = read_f32(tween.num_frames * 6);
    	animation.tweens.push(tween);
    }

    if(ag) ag.animations[animation.name] = animation;
    return animation;
}