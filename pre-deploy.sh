#!/bin/bash
SERVER=$(pwd)
PUBLIC=$SERVER/public
APP=$SERVER/public/app
rm -rf $PUBLIC/*

# Build webclient
cd ../secsy-webclient
ember test
if [ $? -ne 0 ]
then
  exit $?
fi
ember build -prod -o=$APP/
cp bower_components/leaflet/dist/images/* $APP/assets/images/

cd $SERVER

# Build front
cd ../secsy-front
gulp
cp css $PUBLIC/ -rf
cp img $PUBLIC/ -rf
cp js $PUBLIC/ -rf
cp vendor $PUBLIC/ -rf
rm $PUBLIC/img/portfolio -rf
rm $PUBLIC/vendor/font-awesome/less -rf
rm $PUBLIC/vendor/font-awesome/scss -rf
cp de.html $PUBLIC/
cp en.html $PUBLIC/
cp *.ico $PUBLIC/
cp *.png $PUBLIC/

cd $SERVER

npm test
if [ $? -ne 0 ]
then
  exit $?
fi


