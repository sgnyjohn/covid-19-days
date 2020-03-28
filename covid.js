/* 25/março/2020 14:59:59 by sgnyjohn
*/


new covid();
//*******************************
function covid() { 
	var doc = document;
	var ds;
	var bd;
	var Pais = 'Brazil';
	var dt; //data max do país
	var fs = function(a,b) {
			return fSort(strZero(a[3],5)+strZero(a[4],5),strZero(b[3],5)+strZero(b[4],5),true);
		};
	var days = [
		['days+50c','day (total_cases > 50)'
			,function() {return bd.get('total_cases')*1>50?bd.get('days+50c',0,-1)*1+1:0} ]
		,['days+20d','day (total_deaths > 20)'
			,function() {return bd.get('total_deaths')*1>20?bd.get('days+20d',0,-1)*1+1:0} ]
	];
	var tag = {'américa do sul':'~Argentina~Bolivia~Bouvet Island~Brazil~Chile~Colombia~Ecuador~Falkland Islands~French Guiana~Guyana~Paraguay~Peru~South Georgia~South Sandwich Islands~Suriname~Uruguay~Venezuela~'
		,'américa central':'~Belize~Costa Rica~El Salvador~Guatemala~Honduras~Nicaragua~Panama~'
		,'américa do norte':'~Anguilla~Antigua and Barbuda~Aruba~The Bahamas~Barbados~Belize~Bermuda~Bonaire~British Virgin Islands~Canada~Cayman Islands~Clipperton Island~Costa Rica~Cuba~Curaçao~Dominica~Dominican Republic~El Salvador~Federal Dependencies of Venezuela~Greenland~Grenada~Guadeloupe~Guatemala~Haiti~Honduras~Jamaica~Martinique~Mexico~Montserrat~Nicaragua~Nueva Esparta~Panama~Puerto Rico~Saba~San Andrés and Providencia~Saint Barthélemy~Saint Kitts and Nevis~Saint Lucia~Saint Martin~Saint Pierre and Miquelon~Saint Vincent and the Grenadines~Sint Eustatius~Sint Maarten~Trinidad and Tobago~Turks and Caicos Islands~United States~United States Virgin Islands~'
	}
	//lert('days='+days);
	setTimeout(init,1000);
	//***************************
	function click(ev) {
		var o = targetEvent(ev);
		//lert('o='+o.tagName+' '+o);
		if (o.tagName=='SELECT') {
			Pais = o.value;
			ds.innerHTML = '';
			mostra();
			return;
		} if (o.tagName != 'tr') {
			//bjNav(o);alert(1);
			o = getParentByTagName(o,'tr');
		}
		//bjNav(o);alert(2);
		Pais = o.cells.item(1).innerHTML;
		ds.innerHTML = '';
		mostra();
	}
	//***************************
	function mostra1() {
		var v = doc.getElementsByClassName('bdToDom');
		for (var i=0;i<v.length;i++) {
			v[i].addEventListener('click',click,true);
			var tr = v[i].getElementsByTagName('tr');
			for (var c=0;c<tr.length;c++) {
				if (tr[c].childNodes.item(1).innerHTML==Pais) {
					tr[c].className = 'B';
				}
			}
		}
	}
	//***************************
	function getPos(loc,vr,pos) {
		//vetor aux
		bd.top();
		var vc=[],vc1=[];
		while (bd.next()) {
			if (bd.get(vr)==pos && bd.get('location')!='World') {
				vc[vc.length] = bd.getVetor();
			}
		}
		//ordena
		vc.sort(fs);
		//localiza posição
		for (var i=0;i<vc.length;i++) {
			if (vc[i][1]==loc) {
				return i+1;
			}
		}
		return -1;
	}
	//***************************
	function mostra() {
		//procura pais e pega dt, days maximos do país
		//	e monta option selects
		dt=''; 
		bd.top();
		var rr='<option>(country)~';
		bd.eval(function(){
			//options
			if (rr.indexOf('>'+bd.get('location')+'~')==-1)
				rr += '<option>'+bd.get('location')+'~';
			//dt e max dias
			if (bd.get('location')==Pais && dt<bd.get('date') ) {
				dt = bd.get('date');
				aeval(days,function(x) {x[3] = bd.get(x[0]);}); //days maximos
			} 
		});
		
		//mostra dada
		domObj({tag:'h1',style:'margin:0;color:red;'
			,'':dt
		,targ:ds});
		//select country
		domObj({tag:'select',style:'float:right;font-size:80%;color:red;'
			,'':troca(rr,'~','')
			,ev_change:click
		,targ:ds});
		
		//monta evol ranking pais ult 7 days
		var bl = new bancoDados('evol '+Pais);
		bl.className = 'eGeral';
		//lert('dt='+dt);
		for (var i=0;i<7;i++) {
			bl.addReg(); 
			aeval(days,function(x) {
					bl.set('date',leftAt(dataSql(strToData(dt).getTime()-(6-i)*1000*3600*24),' '));
					var d = x[3]-(6-i);
					bl.set('day '+x[0],(d<1?'-':d+'º day'));
					bl.set('position '+x[0],(d<1?'-':getPos(Pais,x[0],x[3]-(6-i))+'º'));
			});
		}
		
		// monta resumo pais, mundo e dias
		// date 0,location 1,new_cases 2,new_deaths 3,total_cases 4,total_deaths 5+days_c50 6+days_Nzero 7
		bd.top();
		var vd=[],vp=[];
		aeval(days,function(x){x[4]=[];});
		while (bd.next()) {
			//dados pais
			if (bd.get('location')==Pais && bd.get('new_cases'  ,0)*1+bd.get('new_deaths'  ,0)*1
					+bd.get('total_cases',0)*1+bd.get('total_deaths',0)*1>0 ) {
				vp[vp.length] = bd.getVetor();
			}
			//dados mundo
			if (bd.get('date')==dt) {
				vd[vd.length] = bd.getVetor();
			}
			//dados dias
			aeval(days,function(x) {
				if (bd.get(x[0])==x[3]) { //igual ao days do pais
					x[4][x[4].length] = bd.getVetor();
				}
			});
		}

		//mostra dias
		aeval(days,function(x) {
			x[4].sort(fs);
			domObj({tag:'h2','':Pais+' '+x[3]+'º '+x[1],targ:ds});
			bd.toDom(ds,999,x[4]);
		});
		
		//ranking dias do país
		domObj({tag:'h2','':'Evolution of the position: '+Pais,targ:ds});bl.toDom(ds,999);		
		
		//dados país
		domObj({tag:'h2','':Pais+' '+dt,targ:ds});bd.toDom(ds,999,vp);

		//dados do mundo
		vd.sort(fs);
		domObj({tag:'h2','':'world '+dt,targ:ds});bd.toDom(ds,999,vd);

		//fonte dados
		var u = 'https://covid.ourworldindata.org';
		domObj({tag:'p',style:'float:right;font-size:80%;text-alignx:right;'
			,'':'fonte: <a href='+u+'>'+u+'</a>'
		,targ:ds});

		setTimeout(mostra1,500);
	}
	//***************************
	function on(s) {
		if (!ds) {
			document.body.innerHTML += '<p>'+s+'</p>';
			return;
		}
		var p = doc.createElement(p);
		p.innerHTML = s;
		ds.appendChild(p);
	}
	//***************************
	function init() {
		//inicio
		ds = browse.getId('dst');
		if (!ds) {
			on('nenhum id=dst...');
			return; 
		}
		(new carregaUrl()).abre('dados/last.csv?dt'+format(ms()/(1000*60*10),0),function(a,b,tx) {
			//lert('tx='+tx);
			//date,location,new_cases,new_deaths,total_cases,total_deaths+days_c50+days_Nzero
			bd = new bancoDados();
			bd.dlCol = ','; 
			bd.setMatriz(tx);
			//(a>b?1:(a<b?-1:0));
			bd.sort(function(a,b) {return a[1]>b[1]?1:(a[1]<b[1]?-1:
					(a[0]>b[0]?1:(a[0]<b[0]?-1:0)) //1a coluna = sort 2a coluna
			);});
			bd.top();
			while (bd.next()) {
				var ig = bd.get('location')==bd.get('location','?',-1); //loc atual igual anterior

				//incrementa contadores conforme vetor
				for (var i=0;i<days.length;i++) {
					//lert(days.length+' '+i);
					bd.set(days[i][0],(days[i][2])());
				}
				
				/*/total
				bd.set('total',
					 bd.get('new_cases'  ,0)*1+bd.get('new_deaths'  ,0)*1
					+bd.get('total_cases',0)*1+bd.get('total_deaths',0)*1
				);
				*/
				
			}
			setTimeout(mostra,1000);
		});
	}

}
