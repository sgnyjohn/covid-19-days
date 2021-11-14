#!/bin/bash

log() {
	local lg=/var/log/coronavirus-bx.log
	echo "$(date "+%Y-%m-%d	não %H:%M:%S_%a")	$1" >>$lg
}

log "bxOms init"

alvo=$(dirname "$0")/dados
if ! test -d $alvo; then
	echo "directory not exists $alvo"
	exit 1
fi
cd $alvo

hopWeb="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/"
hopDr=hop

#########################################
#arquiva dados em gz
arquiva() {
	# antes - /dev/ploop16276p1  20509264 18851156    1170128  95% /
	# depois - /dev/ploop16276p1   20G   14G  6,1G  69% /
	# 1,2G Jun 21 13:55 covid19-2021-06-21-13-48-29-Seg.tar.gz
	
	
	diasManter=28
	diasCopiar=14 

	log "init arquiva - diasManter=$diasManter diasCopiar=$diasCopiar"

	# em /etc/crontab para todos os dias as 2
	# 13 2 * * * root bash /srv/guarani/noticias/limpa.sh

	od=/var/www/lar.art.br/dev/coronavirus/dados
	dd=/home/signey/bak/covid
	adPrf=covid19
	if [ "$(hostname)" == "rasp" ]; then
		log "rasp"
		od=/srv/http/coronavirus/dados
		dd=/dados/webDados/covid
	fi

	aaq="$dd/$adPrf-$(date "+%Y-%m-%d-%H-%M-%S-%a")"
	at=$aaq.log

	#de 7 em 7 dias com janela 40min
	temF=$(find $dd  -mmin -$[1440*$diasCopiar-40] -name "$adPrf-*.tar.gz" -ls)
	if [ "$temF" != "" ]; then
		echo "===> ABORT tem feito $diasCopiar dias...
			$temF
		"
		log "arquivo sair $temF"
		exit 0
	fi

	log "===>> iniciar arquiva
$(df)"

	ad="$aaq.tar.gz"

	cd $od
	find -mtime +$diasManter -type f|egrep -v "pop.csv|.7z|lixo" >$at

	tar czvf $ad -T $at
	f=$?

	#exclui?
	if [ $f -eq 0 ]; then
		cat $at|while read ln; do
			if true; then
				rm -fv $ln
			else
				echo "rm $ln"
			fi
		done
	fi

	#rm $at
	ls -lh $ad
	log "$(ls -lh $aaq*)
===>> FIM arquiva
$(df)"

}

###########################################################
# hop publica arquivos por dia e revê arquivos anteriores
# rm dados/hop/*
# bash bxOms.sh bxHopkinsTudo
# zerar dados/hop.csv
# executar hopUpdate.sh
bxHopkinsTudo() {
	if ! test -d $hopDr; then
		echo "dir \"$hopDr\" não existe!"
		exit 1
	fi
	local p=1
	local ad
	local dt
	while [ "$dt" != "01-22-2020" ]; do
		dt=$(date -d "$p day ago" "+%m-%d-%Y")
		ad="$hopDr/$dt.csv"
		if ! test -e $ad; then
			echo "bx $ad "
			wget -q -O "$ad" "$hopWeb/$dt.csv"
		fi
		let p=p+1
	done
}

bxHopkins() {
	if ! test -d $hopDr; then
		log "dir \"$hopDr\" não existe!"
		exit 1
	fi
	#01-22-2020.csv
	local b=$hopWeb
	local d=$hopDr
	! test -d $d && mkdir $d
	find $d -size 0 -exec rm -fv "{}" \;
	local dt=$(date -d "yesterday 13:00"  "+%m-%d-%Y")
	local ad="$d/$dt.csv"
	if ! test -e "$ad" ; then
		wget -O "$ad" "$b/$dt.csv"
		if ! test -e "$ad"; then
			log "não existe"
		elif [ $(stat -c %s "$ad") -le 300000 ]; then
			log "tamanho invalido rm $(ls -l $ad)"
			rm $ad
		elif test -e $ad; then
			log "vai processar $aq"
			local x=$(pwd)
			cd $alvo/..
			bash hopUpdate.sh
			cd $x	
		fi
	fi
}

##################################################
##################################################
bxOms() {
	ur="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports/"
	ds=/tmp/oms.html
	# https://www.who.int/docs/default-source/coronaviruse/situation-reports/20200123-sitrep-3-2019-ncov.pdf?sfvrsn=d6d23643_8
	if ! test -e $ds; then
		wget -O "$ds" "$ur"
	fi

	ex1="/coronaviruse/situation-reports"
	 
	cat $ds|sed 's/</\n</g'|egrep "<a "|grep "$ex1"\
		|tr ' ' '\n'|grep href|tr '"' '\n'|grep "$ex1"|\
	while read ln; do
		md=$(echo $ln|md5sum|cut -d' ' -f 1)
		aq=$(basename "$ln")
		aq="$(echo $aq|cut -d'?' -f 2)-$(echo $aq|cut -d'?' -f 1)"
		aq="$md-$aq"
		if ! test -e $aq; then
			wget -O $aq https://www.who.int$ln
			rm last.pdf
			ln -s $aq last.pdf 
		fi
	done
}

##################################################
##################################################
bxOurWorldInData() {
	ant=$(ls -t full_data*.csv | head -n 1)
	if [ "$ant" == "" ]; then
		ant=full_dataX.csv
		echo "" >$ant
	fi
	nov="full_data-$(date "+%Y-%m-%d-%H:%M:%S").csv"
	tmp=/tmp/crona.bx
	#até nov
	local url="https://covid.ourworldindata.org/data/ecdc/full_data.csv"
	#a partir dez
	url="https://covid.ourworldindata.org/data/owid-covid-data.csv"
	# ou ?
	#url="https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv"
	wget -O $tmp "$url"
	if [ $? -ne 0 ]; then
		echo "erro bx "
		rm $tmp
	elif cmp $ant $tmp; then
		echo "iguais"; #read
	else
		ln=last.csv
		echo "dif"; #read
		mv $tmp $nov
		rm $ln
		ln -s $nov $ln
	fi
}

##################################################
##################################################
bxCsv() {
	local url="$1"
	local tp="$2"
	ant=$(ls -tc ${tp}full_data*.csv | head -n 1)
	if [ "$ant" == "" ]; then
		ant=${tp}full_dataX.csv
		echo "" >$ant
	fi
	nov="${tp}full_data-$(date "+%Y-%m-%d-%H:%M:%S").csv"
	tmp=/tmp/crona.bx
	test -e $tmp && rm $tmp
	wget -O $tmp "$url"
	if [ $? -ne 0 ]; then
		echo "erro bx "
		rm $tmp
	elif cmp $ant $tmp; then
		echo "iguais"; #read
	else
		echo "dif"; #read
		mv $tmp $nov
		rm ${tp}last.csv
		ln -s $nov ${tp}last.csv
	fi
}


if [ "$1" == "" ]; then
	log "==> bxOms bxOms"
	bxOms
	log "==> bxOms bxOurWorldInData"
	bxOurWorldInData
	log "==> bxOms bxHopkins"
	bxHopkins
	log "==> bxOms bxCsv"
	bxCsv "https://opendata.ecdc.europa.eu/covid19/casedistribution/csv" "eu_"
elif [ "$1" == "1" ]; then
	log "==> bxOms bxOurWorldInData"
	bxOurWorldInData
else
	$1
fi

