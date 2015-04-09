window.$ = function(){
"use strict";

var list = document.getElementById('feature-list');
list.removeChild(list.firstChild);

BerryTweaks.categories.forEach(function(cat){
	var title = document.createElement('h4');
	title.textContent = cat.title;

	var li = document.createElement('li');
	list.appendChild(li);

	var ul = document.createElement('ul');
	li.appendChild(title);
	li.appendChild(ul);

	cat.configs.forEach(function(conf){
		li = document.createElement('li');
		li.textContent = BerryTweaks.configTitles[conf];
		ul.appendChild(li);
	});
});

};
