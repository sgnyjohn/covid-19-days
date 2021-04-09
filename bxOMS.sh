#!/bin/bash

alvo=$(dirname "$0")/dados
if ! test -d $alvo; then
	echo "directory not exists $alvo"
	exit 1
fi
cd $alvo

hopWeb="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/"
hopDr=hop

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
		echo "dir \"$hopDr\" não existe!"
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
	fi
	local x=$(pwd)
	cd $alvo/..
	bash hopUpdate.sh
	cd $x	
}


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
	bxOms
	bxOurWorldInData
	bxHopkins
	bxCsv "https://opendata.ecdc.europa.eu/covid19/casedistribution/csv" "eu_"
elif [ "$1" == "1" ]; then
	bxOurWorldInData
else
	$1
fi

