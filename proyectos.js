'use strict'

window.onload = alCargar

let conf = {
	'sprints' : {
		'media' : 10,
		'desviacion_tipica' : 0
	}
	,'requerimientos' : {
		'media' : 2,
		'desviacion_tipica' : 0,
		'p_error': 0
	},
	'historias' : {
		'media' : 2,
		'desviacion_tipica' : 0,
		'p_error': 0
	},
	'componentes' : {
		'media' : 2,
		'desviacion_tipica' : 0,
		'p_error': 0
	},
	'equipos' : {
		'media' : 5,
		'desviacion_tipica' : 0
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
		this.repositorio = new Set()
		this.explotacion = new Set()
	}
	
	iniciar(){
		let divInicial = document.getElementById('divInicial')
		divInicial.parentNode.removeChild(divInicial)
		this.dibujar()
		modal.mostrar('Empieza el proyecto')
	}
	
	ejecutar(sprint){
		for(let equipo of this.equipos)
			if (equipo.asignadoA != null)
				if (equipo.asignadoA == 'integracion')
					juego.integrar()
				else
					equipo.asignadoA.ejecutar()
		
		sprint.desactivar()
		
		//Calculamos el % completado del proyectos
		let completados = 0
		for(let requerimiento of this.requerimientos)
			if (requerimiento.estado == 'completado')
				completados += 1 
		
		//Comprobamos si se han completado todos los requerimientos
		if (completados == this.requerimientos.length){
			modal.mostrar('Has completado el 100% del proyecto')
			return
		}
		
		//Cambio de Sprint
		let proximoSprint = sprint.div.nextSibling
		if (proximoSprint != null)
			juego.buscarSprintPorId(proximoSprint.id).activar()
		else
			modal.mostrar('No te ha dado tiempo. Has completado el ' + (100.0*completados/this.requerimientos.length) + '% del proyecto')		
	}
	
	integrar(){
	//Pasamos los componentes del repositorio al entorno de explotación
		for(let componente of this.repositorio)
			this.explotacion.add(componente)
		//Quitamos los componentes del entorno de explotación y los volvemos a poner
		let divProduccion = document.getElementById('divProduccion')
		while(divProduccion.childNodes.length > 0)	//Dejamos la imagen
			divProduccion.removeChild(divProduccion.lastChild)
		for(let componente of this.explotacion){
			//Quitamos el equipo del clone
			let clon = componente.div.cloneNode(true)
			if (clon.getElementsByClassName('equipo').length > 0)
				clon.removeChild(clon.getElementsByClassName('equipo')[0])
			divProduccion.appendChild(clon)
		}
	}
	
	generar(clase){
		let resultado = []
		let componente = clase.name.toLowerCase() + 's'
		let numComponentes = random_normal(conf[componente].media, conf[componente].desviacion_tipica)
		for(let i = 0; i < numComponentes; i++)
			resultado.push(new clase())
			
		return resultado
	}
	
	dibujar(){
		let divPrincipal = document.createElement('div')
		document.getElementsByTagName('body')[0].appendChild(divPrincipal)
		divPrincipal.id = 'divPrincipal'
		
		//Sprints
		let tituloTiempo = document.createElement('h2')
		divPrincipal.appendChild(tituloTiempo)
		tituloTiempo.appendChild(crearIcono('update'))
		tituloTiempo.appendChild(document.createTextNode(' Tiempo'))
		let divSprints = document.createElement('div')
		divPrincipal.appendChild(divSprints)
		divSprints.id = 'divSprints'
		let i = 0
		for(let sprint of this.sprints){
			divSprints.appendChild(sprint.crearDiv(i++ == 0))
		}
		
		//Diario
		let divContenedorDiario = document.createElement('div')
		divPrincipal.appendChild(divContenedorDiario)
		divContenedorDiario.id = 'contenedor_diario'
		let tituloDiario = document.createElement('h2')
		divContenedorDiario.appendChild(tituloDiario)
		tituloDiario.appendChild(crearIcono('edit'))
		tituloDiario.appendChild(document.createTextNode(' Diario'))
		let divDiario = document.createElement('div')
		divContenedorDiario.appendChild(divDiario)
		divDiario.id = 'divDiario'
		
		//Desarrollo: Requerimientos-Historias-Componentes
		let tituloTrabajo = document.createElement('h2')
		divPrincipal.appendChild(tituloTrabajo)
		tituloTrabajo.appendChild(crearIcono('keyboard'))
		tituloTrabajo.appendChild(document.createTextNode(' Trabajo'))
		let divDesarrollo = document.createElement('div')
		divPrincipal.appendChild(divDesarrollo)
		divDesarrollo.id = 'divDesarrollo'
		let divRequerimientos = document.createElement('div')
		divDesarrollo.appendChild(divRequerimientos)
		divRequerimientos.id = 'divRequerimientos'
		for(let requerimiento of this.requerimientos)
			divRequerimientos.appendChild(requerimiento.crearDiv())
			
		//Div de Integracion
		let divContenedorIntegración = document.createElement('div')
		divDesarrollo.appendChild(divContenedorIntegración)
		divContenedorIntegración.id = 'contenedor_integracion'
		
		let tituloProduccion = document.createElement('h2')
		divContenedorIntegración.appendChild(tituloProduccion)
		tituloProduccion.appendChild(crearIcono('location_city'))
		tituloProduccion.appendChild(document.createTextNode(' Producción'))
		
		let divProduccion = document.createElement('div')
		divContenedorIntegración.appendChild(divProduccion)
		divProduccion.id = 'divProduccion'
		
		let divIntegracion = document.createElement('div')
		divContenedorIntegración.appendChild(divIntegracion)
		divIntegracion.id = 'divIntegracion'
		
		//Drop
		divIntegracion.ondragover = function(evento){
			evento.preventDefault()
		}
		divIntegracion.ondrop = function(evento){
			//Efecto gráfico
			evento.preventDefault()
  			let id = evento.currentTarget.id
  			let idEquipo = evento.dataTransfer.getData('equipo')
			evento.currentTarget.appendChild(document.getElementById(idEquipo))

			//Asignación de Equipo			
  			let equipo = juego.buscarEquipoPorId(idEquipo)
  			equipo.asignadoA = 'integracion'
		}
		
		let flecha = crearIcono('arrow_upward')
		flecha.id = 'icono_integracion'
		divIntegracion.appendChild(flecha)
		
		let tituloRepositorio = document.createElement('h2')
		divContenedorIntegración.appendChild(tituloRepositorio)
		tituloRepositorio.appendChild(crearIcono('public'))
		tituloRepositorio.appendChild(document.createTextNode(' Repositorio'))
		
		let divRepositorio = document.createElement('div')
		divContenedorIntegración.appendChild(divRepositorio)
		divRepositorio.id = 'divRepositorio'
		
		//Tests
		let divTests = document.createElement('div')
		divDesarrollo.appendChild(divTests)
		divTests.id = 'divTests'
		for(let requerimiento of this.requerimientos)
			divTests.appendChild(requerimiento.test.crearDiv())

		//Equipos
		let tituloEquipo = document.createElement('h2')
		divPrincipal.appendChild(tituloEquipo)
		tituloEquipo.appendChild(crearIcono('people'))
		tituloEquipo.appendChild(document.createTextNode(' Equipo'))
		
		let divEquipo = document.createElement('div')
		divPrincipal.appendChild(divEquipo)
		divEquipo.id = 'divEquipos'
		for(let equipo of this.equipos)
			divEquipo.appendChild(equipo.crearDiv())
			
		//Drop
		divEquipo.ondragover = function(evento){
			evento.preventDefault()
		}
		divEquipo.ondrop = function(evento){
			//Efecto gráfico
			evento.preventDefault()
  			let id = evento.currentTarget.id
  			let idEquipo = evento.dataTransfer.getData('equipo')
			evento.currentTarget.appendChild(document.getElementById(idEquipo))

			//Desasignación		
  			let equipo = juego.buscarEquipoPorId(idEquipo)
  			equipo.asignadoA = null
		}
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
		for(let requerimiento of this.requerimientos)
			try{
				return this.buscarEnArrayPorId(requerimiento.historias, id)
			}catch(excepcion){}
		throw `${id} no encontrado.`
	}

	buscarComponentePorId(id){
		for(let requerimiento of this.requerimientos)
			for(let historia of requerimiento.historias)
				try{
					return this.buscarEnArrayPorId(historia.componentes, id)
				}catch(excepcion){}
		throw `${id} no encontrado.`
	}
	
	buscarTestPorId(id){
		for(let requerimiento of this.requerimientos)
			if (requerimiento.test.id == id)
				return requerimiento.test
		throw `${id} no encontrado.`
	}
	
	buscarEnArrayPorId(array, id){
		for(let objeto of array)
			if (objeto.id == id)
				return objeto
		throw `${id} no encontrado.`
	}
}

//Clase General de la que derivan el resto
class General{
	constructor(){
		this.id = this.constructor.name.charAt(0) + this.constructor.indice++
		this.div = null
	}
}

class Sprint extends General{
	constructor(){
		super()
		this.activo = false
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
		this.onclick = null
	}
}
Sprint.indice = 1
	
class Requerimiento extends General{
	constructor(){
		super()
		this.historias = []
		this.test = new Test(this)
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
  			let id = evento.currentTarget.id
  			let idEquipo = evento.dataTransfer.getData('equipo')
			evento.currentTarget.appendChild(document.getElementById(idEquipo))

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
		//Si ya ha sido ejecutado, no se repite
		if (this.historias.length > 0) return
		
		//Borrado
		while (this.divHistorias.firstChild) {
    		this.divHistorias.removeChild(this.divHistorias.lastChild)
  		}
  		
		this.historias = juego.generar(Historia)
		
		for(let historia of this.historias){
			historia.requerimiento = this
			this.divHistorias.appendChild(historia.crearDiv())
		}
			
		this.div.appendChild(document.createTextNode(' -?'))
		this.estado = 'terminado'
		/*if(Math.random() < conf.requerimientos.p_error)
			this.estado = 'erróneo'
		else
			this.estado = 'correcto'*/
	}
}
Requerimiento.indice = 1

class Equipo extends General{
	constructor(){
		super()
		this.asignadoA = null
	}
	
	crearDiv(){
		let div = document.createElement('div')
		div.classList.add('equipo')
		div.id=this.id
		div.appendChild(crearIcono('face'))
		div.appendChild(document.createTextNode(this.id))
		
		//Drag
		div.setAttribute('draggable', true)
		div.ondragstart = function(evento) {
			evento.dataTransfer.setData('equipo', evento.currentTarget.id)
		}
		return div
	}
}
Equipo.indice = 1

class Historia extends General{
	constructor(){
		super()
		this.requerimiento = null	//requerimiento al que pertenece la historia
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
			let id = evento.currentTarget.id
  			let idEquipo = evento.dataTransfer.getData('equipo')
			evento.currentTarget.appendChild(document.getElementById(idEquipo))

			//Asignación de Equipo			
  			let equipo = juego.buscarEquipoPorId(idEquipo)
  			equipo.asignadoA = juego.buscarHistoriaPorId(id)
		}
		return divContenedor
	}
	
	ejecutar(){		//Diseño de la Historia
		//Si ya ha sido ejecutado, no se repite
		if (this.componentes.length > 0) return

		//Borrado del divComponentes
		while (this.divComponentes.firstChild) {
    		this.divComponentes.removeChild(this.divComponentes.lastChild)
  		}
  		
		this.componentes = juego.generar(Componente)
		
		for(let componente of this.componentes){
			componente.historia = this
			this.divComponentes.appendChild(componente.crearDiv())
		}
			
		this.div.appendChild(document.createTextNode(' -?'))
		this.estado = 'terminado'
	}
}
Historia.indice = 1

class Componente extends General{
	constructor(){
		super()
		this.historia = null	//historia a la que pertenece el componente
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
  			let id = evento.currentTarget.id
  			let idEquipo = evento.dataTransfer.getData('equipo')
			evento.currentTarget.appendChild(document.getElementById(idEquipo))

			//Asignación de Equipo			
  			let equipo = juego.buscarEquipoPorId(idEquipo)
  			equipo.asignadoA = juego.buscarComponentePorId(id)
		}
		return this.div
	}
	
	ejecutar(){		//Desarrollo del Componente
		
		//Si ya está en el respositorio, no hacemos nada
		if (juego.repositorio.has(this)) return
		
		//TODO: quitar el icono de resultado si ya tiene uno. O cambiarlo
		/*
		if (Math.random() < conf.componentes.p_error){
			this.div.appendChild(crearIcono('error'))
			this.estado = 'erroneo'
		}
		else{*/
			this.div.appendChild(crearIcono('done'))
			this.estado = 'correcto'	
			juego.repositorio.add(this)
			let divRepositorio = document.getElementById('divRepositorio')
			let clon = this.div.cloneNode(true)
			//Quitamos el equipo del clone
			clon.removeChild(clon.getElementsByClassName('equipo')[0])
			divRepositorio.appendChild(clon)
		//}
	}
}
Componente.indice = 1

class Test extends General{
	constructor(requerimiento){
		super()
		this.requerimiento = requerimiento		//requerimiento al que corresponde el Test
	}
	
	crearDiv(){
		this.div = document.createElement('div')
		this.div.id = this.id
		this.div.classList.add('testSuite')
		this.div.appendChild(crearIcono('help_outline'))
		this.div.appendChild(document.createTextNode(this.div.id))
		
		//Drop
		this.div.ondragover = function(evento){
			evento.preventDefault()
		}
		this.div.ondrop = function(evento){
			//this es el div que recibe el evento
			
			//Efecto gráfico
			evento.preventDefault()
  			let id = evento.currentTarget.id
  			let idEquipo = evento.dataTransfer.getData('equipo')
			evento.currentTarget.appendChild(document.getElementById(idEquipo))

			//Asignación de Equipo			
  			let equipo = juego.buscarEquipoPorId(idEquipo)
  			equipo.asignadoA = juego.buscarTestPorId(id)
		}
		
		return this.div
	}
	
	ejecutar(){		//Ejecución del Test
		//Comprobamos si los componentes de las historias del Requerimiento asociado al test están en el entorno de explotación
		for(let historia of this.requerimiento.historias)
			for(let componente of historia.componentes)
				if (!juego.explotacion.has(componente))
					return
		this.requerimiento.estado = 'completado'
		this.requerimiento.div.classList.add('completado')
	}
}
Test.indice = 1

class Modal{
	constructor(){
		this.div = document.createElement('div')
		this.div.classList.add('modal')
		this.divContenido = document.createElement('div')
		this.div.appendChild(this.divContenido)		
		this.divContenido.classList.add('modal-contenido')
		this.spanCerrar = document.createElement('span')
		this.divContenido.appendChild(this.spanCerrar)
		this.spanCerrar.appendChild(document.createTextNode('×'))
		this.spanCerrar.onclick = this.cerrar.bind(this)
		this.p = document.createElement('p')
		this.divContenido.appendChild(this.p)
		
		document.getElementsByTagName('body')[0].appendChild(this.div)
	}
	
	mostrar(texto){
		while (this.p.firstChild)
			this.p.removeChild(this.p.firstChild)
		this.p.appendChild(document.createTextNode(texto))
		this.div.style.display = "block"
	}
	
	cerrar(){
		this.div.style.display = 'none'
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
let modal = new Modal()

