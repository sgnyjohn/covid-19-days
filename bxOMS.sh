#!/bin/bash

cd $(dirname "$0")/dados

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
	wget -O $tmp https://covid.ourworldindata.org/data/ecdc/full_data.csv
	if [ $? -ne 0 ]; then
		echo "erro bx "
		rm $tmp
	elif cmp $ant $tmp; then
		echo "iguais"; #read
	else
		echo "dif"; #read
		mv $tmp $nov
		rm last.csv
		ln -s $nov last.csv
	fi
}

bxOms
bxOurWorldInData

