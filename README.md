# Go2Mapper

## Go2Mapper support tools (located in /scripts)


Go2Mapper support tools 

Go2 is an OSW package to automatically determine when site visits are needed. One of the reports provided by Go2 contains flags for the various conditions checked each time the program is run.

Go2Mapper is a web page that displays the state boundaries and flags each station with the appropriate Go2 flags. To provide the mapper with the current data, the Go2 report is processed by a cron-controlled script to processes that report and create a JSON structure that can be used by the mapper in real-time.

The python script MapperFlags.py runs on a schedule to check a specific mailbox for Go2 and Go2Lite messages. If found, the message is parsed and a JSON file is stored in the Go2Mapper home directory. The emailed reports are used as Go2Lite does not update the report in the Go2 directory.

A second script, CreateMapperLists.py, runs once a week to collect SIMS information regarding Trips and Sites. This information is used to display information about the site on the mapper. Two files are created, SiteList.json and TripList.json. SiteList contains details about each site, and TripList contains information regarding the trip groupings. The default statecd and wscid should be customized for your office in the script.

A support script, CheckSSLLibrary.py, is supplied to check if the Python SSL library has been corrupted by the Solaris patch 151914-04.  This patch, from around June 2016 causes the SSL librsry to fail.  Removing this patch will correct the problem. There has been a subsequent patch (151914-07) which must be uninstalled first, before the -04 patch can been removed. The -07 patch may then be reapplied without harming the library. Use this script to determine if the patches need to be dealt with. As several patch clusters have been applied since, the appropriate undo.Z may not be available. They have been provided in the distribution package in case you need them.

Two credential files need to be created from the supplied templates. Copy the BisonCredential and AmazonCredential templates and update them with the appropriate credentials as needed. If Amazon is not used, create the file but don't change the text.  This will create the variables as needed, but they won't be used.

Installation

Prerequisites:
   Python V2.6.2 or higher
   Go2
   Bison dropbox for receiving email
     Reference: https://ecomputing.usgs.gov/adi/RequestForGoogleServicesFAQ.html
   OpenAFS for Solaris (Needed for CronAuth)
     Reference: http://unix.usgs.gov/solaris/openafs.html
   CronAuth configuration, or some way to get JSON files to a web server.
     Reference: http://natweb.usgs.gov/software/krb5/automation/

Using the reference link above, request a Bison Shared Email account. 
   The proper name could be in the form GS-W-xx EDL Data (gs-w-xx_edl_data@usgs.gov)
   with an alias of xxdata@usgs.gov. (Ex: GS-W-NY EDL Data, nydata@usgs.gov)
     --- Important ---
   When requesting the mailbox, please request that the switch to allow "less secure apps"  to the mailbox be enabled because Python requires it to work properly.

   An application password for the dropbox is needed. Service Desk will need to provide this
   Replace the credential in the BisonCredential.py script and run CheckSSLLibrary.py to 
   make sure the OS patch is not corrupting the library.

If Cronauth is to be used, verify that OpenAFS is installed on the NWIS server.   Instructions are provided at the reference link above.

If not already installed, configure CronAuth on your NWIS server using the reference above.

Create a directory for the scripts and data files to reside. 
   Typically /usr/local/wrdapp/locapp/Go2Mapper
   If another directory is used, change the paths in the scripts/cron to match

In CreateMapperFiles.py, update the 'statecd' and 'wscid' values for your WSC.

In Go2, add an entry in SENDTO.control for your data mailbox.
   In NY:  ALL!email!nydata@usgs.gov!L!A!T!B!Y

To automate the process, add the two tasks to a valid cron user and adjust the 
schedule accordingly.. 
   `0,15,30,45 * * * *  /usr/local/wrdapp/locapp/Go2Mapper/MapperFlags.py >/dev/null 2>&1`
   `05 02 * * 6 /usr/local/wrdapp/locapp/Go2Mapper/CreateMapperFiles.py`

The JSON files need to be copied to the mapper site directory for the mapper to retrieve them. In NY, we use CronAuth to rsync the files to Natweb and the Mapper site directory.



----------
## Mapper application
pre-requisites: [node.js](https://nodejs.org/en/download/) installed

####  Set up project
run `npm install` to install dependencies

#### Customize application
run `npm start` to launch a development web server with live reloading.  Then edit `/src/scripts/app.js`  'user config variables' section near the top of the file.

#### Build app bundle
`npm run build` to run create a production ready bundle set.  This is not used until you are satisfied you have finished edits and are ready to copy to your web server.  Copy the entire contents of `/dist` to your web server


#### Known go2mapper applications
v2
[NYWSC (original)](https://ny.water.usgs.gov/maps/go2/)
[OHWSC](https://oh.water.usgs.gov/maps/go2/)

v1
[INWSC](https://in.water.usgs.gov/datas/go2mapper/)
[KYWSC](https://ky.water.usgs.gov/datas/go2mapper/)
[SAWSC](https://www2.usgs.gov/water/southatlantic/usgs/maps/go2/)

In progress
CAWSC
WAWSC
AKWSC