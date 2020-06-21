'use strict'

window.onload = alCargar

let conf = {
	'sprints' : {
		'media' : 8,
		'desviacion_tipica' : 0.5
	}
	,'requerimientos' : {
		'media' : 3,
		'desviacion_tipica' : 0.25,
		'p_error': 0.3
	},
	'historias' : {
		'media' : 3,
		'desviacion_tipica' : 0.5,
		'p_error': 0.2
	},
	'componentes' : {
		'media' : 3,
		'desviacion_tipica' : 0.5,
		'p_error': 0.2
	},
	'equipos' : {
		'media' : 3,
		'desviacion_tipica' : 0.5
	}
}

function alCargar(){
	document.getElementsByTagName('button')[0].onclick = juego.iniciar.bind(juego)	
}

class Juego{
	constructor(){
		this.sprints = this.generar(Sprint)
		this.requerimientos = this.generar(Requerimiento)
		this.equipos = this.generar(Equipo)
	}
	
	iniciar(){
		let divInicial = document.getElementById('divInicial')
		divInicial.parentNode.removeChild(divInicial)
		this.dibujar()
	}
	
	ejecutar(sprint){
		for(let i=0; i < this.equipos.length; i++)
			if (this.equipos[i].asignadoA != null)
				if (this.equipos[i].asignadoA == 'implantación')
					console.log('TODO: Ejecutar implantación')
				else
					this.equipos[i].asignadoA.ejecutar()
		
		//Cambio de Sprint
		sprint.desactivar()
		let proximoSprint = sprint.div.nextSibling
		if (proximoSprint != null)
			juego.buscarSprintPorId(proximoSprint.id).activar()
		else
			juego.terminarPorTiempo()
	}
	
	generar(clase){
		let resultado = []
		let componente = clase.name.toLowerCase() + 's'
		let numComponentes = random_normal(conf[componente].media, conf[componente].desviacion_tipica)
		for(let i = 0; i < numComponentes; i++)
			resultado.push(new clase(`${clase.name.charAt(0)}${i+1}`))
			
		return resultado
	}
	
	dibujar(){
		let divPrincipal = document.createElement('div')
		document.getElementsByTagName('body')[0].appendChild(divPrincipal)
		divPrincipal.id = 'divPrincipal'
		
		//Sprints
		let divSprints = document.createElement('div')
		divPrincipal.appendChild(divSprints)
		divSprints.id = 'divSprints'
		for(let i=0; i<this.sprints.length; i++){
			divSprints.appendChild(this.sprints[i].crearDiv(i==0))
		}
		
		//Desarrollo: Requerimientos-Historias-Componentes
		let divDesarrollo = document.createElement('div')
		divPrincipal.appendChild(divDesarrollo)
		divDesarrollo.id = 'divDesarrollo'
		let divRequerimientos = document.createElement('div')
		divDesarrollo.appendChild(divRequerimientos)
		divRequerimientos.id = 'divRequerimientos'
		for(let i=0; i<this.requerimientos.length; i++)
			divRequerimientos.appendChild(this.requerimientos[i].crearDiv())
			
		//Div de Implantación
		let divImplantacion = document.createElement('div')
		divImplantacion.id = 'divImplantacion'
		divDesarrollo.appendChild(divImplantacion)
		let img1 = document.createElement('img')
		divImplantacion.appendChild(img1)
		img1.setAttribute('src', 'arrow.svg')
		let img2 = document.createElement('img')
		divImplantacion.appendChild(img2)
		img2.setAttribute('src', 'repositorio.svg')
		//Drop
		divImplantacion.ondragover = function(evento){
			evento.preventDefault()
		}
		
		divImplantacion.ondrop = function(evento){
			//Efecto gráfico
			evento.preventDefault()
  			let id = evento.target.id
  			let idEquipo = evento.dataTransfer.getData('equipo')
			evento.target.appendChild(document.getElementById(idEquipo))

			//Asignación de Equipo			
  			let equipo = juego.buscarEquipoPorId(idEquipo)
  			equipo.asignadoA = 'implantación'
		}

		//Div de Tests
		let divTests = document.createElement('div')
		divTests.id = 'divTests'
		divDesarrollo.appendChild(divTests)
		for(let i=0; i<this.requerimientos.length; i++)
			divTests.appendChild(this.crearDivTest(this.requerimientos[i]))
		
		//Equipos
		let divEquipo = document.createElement('div')
		divEquipo.id = 'divEquipos'
		document.getElementsByTagName('body')[0].appendChild(divEquipo)
		for(let i=0; i<this.equipos.length; i++)
			divEquipo.appendChild(this.equipos[i].crearDiv())	
	}
	
	crearDivTest(requerimiento){
		let div = document.createElement('div')
		div.classList.add('testSuite')
		div.id=`TS${requerimiento.id}`
		div.appendChild(document.createTextNode(div.id))
		
		//Drop
		return div
	}

	buscarSprintPorId(id){
		return this.buscarEnArrayPorId(this.sprints, id)
	}

	buscarRequerimientoPorId(id){
		return this.buscarEnArrayPorId(this.requerimientos, id)
	}

	buscarEquipoPorId(id){
		return this.buscarEnArrayPorId(this.equipos, id)
	}

	buscarHistoriaPorId(id){
		for(let i = 0; i < this.requerimientos.length; i++)
			try{
				return this.buscarEnArrayPorId(this.requerimientos[i].historias, id)
			}catch(excepcion){}
		throw `${id} no encontrado.`
	}

	buscarComponentePorId(id){
		for(let i = 0; i < this.requerimientos.length; i++)
			for(let j = 0; j < this.requerimientos[i].historias.length; j++)
				try{
					return this.buscarEnArrayPorId(this.requerimientos[i].historias[j].componentes, id)
				}catch(excepcion){}
		throw `${id} no encontrado.`
	}
	
	buscarEnArrayPorId(array, id){
		for(let i = 0; i < array.length; i++)
			if (array[i].id == id)
				return array[i]
		throw `${id} no encontrado.`
	}
}


class Sprint{
	constructor(id){
		this.id = id
		this.activo = false
		this.div = null
	}
	
	crearDiv(activo){
		this.div = document.createElement('div')
		this.div.classList.add('sprint')
		if (activo)
			this.activar()
		this.div.id = this.id
		this.div.appendChild(crearIcono('hourglass_empty'))
		this.div.appendChild(document.createTextNode(this.id))
		this.div.onclick = this.onclick
		return this.div
	}
	
	onclick(evento){
		//this es el div que recibe el click
		let sprint = juego.buscarSprintPorId(this.id)
		if (sprint.activo)
			juego.ejecutar(juego.buscarSprintPorId(this.id))
	}
	
	activar(){
		this.activo = true
		this.div.classList.add('activo')
	}
	
	desactivar(){
		this.activo = false
		this.div.classList.remove('activo')
		this.onclick = null;
	}
}

class Requerimiento{
	constructor(id){
		this.id = id
		this.div = null
		this.historias = []
		this.estado = 'pendiente'	//pendiente, erróneo, correcto
		this.divHistorias = null
	}
	
	crearDiv(){
		let divContenedor = document.createElement('div')
		divContenedor.classList.add('contenedor_requerimiento')
		
		this.div = document.createElement('div')
		divContenedor.appendChild(this.div)
		this.div.id = this.id
		this.div.classList.add('requerimiento')
		this.div.appendChild(crearIcono('euro_symbol'))
		this.div.appendChild(document.createTextNode(this.id))
		
		//Drop
		this.div.ondragover = function(evento){
			evento.preventDefault()
		}
		
		this.div.ondrop = function(evento){
			//Efecto gráfico
			evento.preventDefault()
  			let id = evento.target.id
  			let idEquipo = evento.dataTransfer.getData('equipo')
			evento.target.appendChild(document.getElementById(idEquipo))

			//Asignación de Equipo			
  			let equipo = juego.buscarEquipoPorId(idEquipo)
  			equipo.asignadoA = juego.buscarRequerimientoPorId(id)
		}
		
		//Div de Historias
		let divHistorias = document.createElement('div')
		divContenedor.appendChild(divHistorias)
		this.divHistorias = divHistorias
		divHistorias.classList.add('historias')
		
		return divContenedor
	}
	
	ejecutar(){		//Análisis del requerimiento
		if (this.estado == 'correcto') return
		console.log('Ejecutando Requerimiento ' + this.id)
		
		//Borrado
		while (this.divHistorias.firstChild) {
    		this.divHistorias.removeChild(this.divHistorias.lastChild);
  		}
  		
		this.historias = juego.generar(Historia)
		
		for(let i=0; i<this.historias.length; i++){
			this.historias[i].requerimiento = this
			this.divHistorias.appendChild(this.historias[i].crearDiv())
		}
			
		this.div.appendChild(document.createTextNode(' -?'));
		this.estado = 'terminado'
		/*if(Math.random() < conf.requerimientos.p_error)
			this.estado = 'erróneo'
		else
			this.estado = 'correcto'*/
	}
}

class Equipo{
	constructor(id){
		this.id = id
		this.asignadoA = null
	}
	
	crearDiv(){
		let div = document.createElement('div')
		div.classList.add('equipo')
		div.id=this.id
		div.appendChild(crearIcono('face'))
		div.appendChild(document.createTextNode(this.id))
		/*let img = document.createElement('img')
		div.appendChild(img)
		img.setAttribute('src', 'equipo.svg')
		img.setAttribute('draggable', false)
		*/
		
		//Drag
		div.setAttribute('draggable', true)
		div.ondragstart = function(evento) {
			evento.dataTransfer.setData('equipo', evento.target.id)
		}
		return div
	}
}

class Historia{
	constructor(id){
		this.id = id
		this.div = null
		this.requerimiento = null	//requerimiento al que pertenece la historia
		this.estado = 'pendiente'	//pendiente, erróneo, correcto
		this.componentes = []
		this.divComponentes = null
	}
	
	crearDiv(){
		let divContenedor = document.createElement('div')
		divContenedor.classList.add('contenedor_historia')
		
		this.div = document.createElement('div')
		divContenedor.appendChild(this.div)
		this.div.id = this.id
		this.div.classList.add('historia')
		this.div.appendChild(crearIcono('list'))
		this.div.appendChild(document.createTextNode(this.div.id))
		
		//Div de Componentes
		let divComponentes = document.createElement('div')
		divContenedor.appendChild(divComponentes)
		this.divComponentes = divComponentes
		divComponentes.classList.add('componentes')
		
		//Drop
		this.div.ondragover = function(evento){
			evento.preventDefault()
		}
		this.div.ondrop = function(evento){
			//this es el div que recibe el evento
			
			//Efecto gráfico
			evento.preventDefault()
  			let id = evento.target.id
  			let idEquipo = evento.dataTransfer.getData('equipo')
			evento.target.appendChild(document.getElementById(idEquipo))

			//Asignación de Equipo			
  			let equipo = juego.buscarEquipoPorId(idEquipo)
  			equipo.asignadoA = juego.buscarHistoriaPorId(id)
		}
		return divContenedor
	}
	
	ejecutar(){		//Diseño de la Historia
		if (this.estado == 'correcto') return
		console.log('Ejecutando Historia ' + this.id)
		
		//Borrado del divComponentes
		while (this.divComponentes.firstChild) {
    		this.divComponentes.removeChild(this.divComponentes.lastChild);
  		}
  		
		this.componentes = juego.generar(Componente)
		
		for(let i=0; i<this.componentes.length; i++){
			this.componentes[i].historia = this
			this.divComponentes.appendChild(this.componentes[i].crearDiv())
		}
			
		this.div.appendChild(document.createTextNode(' -?'));
		this.estado = 'terminado'
	}
}

class Componente{
	constructor(id){
		this.id = id
		this.div = null
		this.historia = null	//historia a la que pertenece el componente
		this.estado = 'pendiente'	//pendiente, erróneo, correcto
	}
	
	crearDiv(){
		this.div = document.createElement('div')
		this.div.id = this.id
		this.div.classList.add('componente')
		this.div.appendChild(crearIcono('build'))
		this.div.appendChild(document.createTextNode(this.div.id))
		
		//Drop
		this.div.ondragover = function(evento){
			evento.preventDefault()
		}
		this.div.ondrop = function(evento){
			//this es el div que recibe el evento
			
			//Efecto gráfico
			evento.preventDefault()
  			let id = evento.target.id
  			let idEquipo = evento.dataTransfer.getData('equipo')
			evento.target.appendChild(document.getElementById(idEquipo))

			//Asignación de Equipo			
  			let equipo = juego.buscarEquipoPorId(idEquipo)
  			equipo.asignadoA = juego.buscarComponentePorId(id)
		}
		return this.div
	}
	
	ejecutar(){		//Desarrollo del Componente
		if (this.estado == 'correcto') return
		console.log('Ejecutando Componente ' + this.id)
		
		this.div.appendChild(crearIcono('done'))
		this.estado = 'correcto'

	}
}

/**
	Crea un icono de Material Icons de Google
	Ref: https://material.io/resources/icons/
**/
function crearIcono(nombre){
	//<span class="material-icons">face</span>
	let icono = document.createElement('span')
	//icono.classList.add('material-icons')
	icono.className = 'material-icons'
	icono.appendChild(document.createTextNode(nombre))
	return  icono
}
function crearIcono_old(nombre){
	let icono = document.createElement('img')
	icono.className = 'icono'
	icono.setAttribute('src', `${nombre}.svg`)
	return  icono
}

/**
	Función de distribución de probabilidad normal
**/
function random_normal(media, desviacion_tipica){
	return Math.floor(randn_bm() * desviacion_tipica + media)
}

/**
	Función de distribución de probabilidad normal mediante la transformada de Box-Muller
	Ref: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/36481059#36481059
**/
function randn_bm() {
	var u = 0, v = 0
	while(u === 0) u = Math.random() //Converting [0,1) to (0,1)
	while(v === 0) v = Math.random()
	return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
}

function aleatorio(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min)
}



//PROGRAMA PRINCIPAL
let juego = new Juego()

