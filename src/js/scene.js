function Scene(name, max_entities)
{
	var r = {};
	r.root = Entity(0,0,0);
	r.name = name;
	r.MAX_ENTITIES = max_entities;
	r.entity_count = 1;
	r.entities = new Array(max_entities);
	r.entities[0] = r.root;
	return r;
}

function add_to_scene(scene, e)
{
	scene.entities[scene.entity_count] = e;
	e.entity_count++;
	if(e.parent === null)
	{
		set_parent(e, scene.root);
	}
}

function update_scene(scene, dt)
{
	update_entity(scene.root);
}

function render_scene(scene, camera)
{
	
}