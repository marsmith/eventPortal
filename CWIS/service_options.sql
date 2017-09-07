/*
============================================
CWIS: Current Water Information System
============================================

DATA SERVICE ROOT URL:
    http://txpub.usgs.gov/DSS/CWIS/1.0/services/request.ashx/getData
note: if no URL options specified (like above) service defaults will return site info geojson (@service='site') for all realtime sites in Nation

ADD ONE OR MORE OF THE BELOW "SUPPORTED DATA SERVICE REST PARAMETERS" LIKE THIS:
    http://txpub.usgs.gov/DSS/CWIS/1.0/services/request.ashx/getData?parm1=XXX&parm2=XXX&...

EXAMPLE:
@service      = 'flow'      ...use flow service (output sites measuring gage height 00065)
@States       = 'ma,ny,ct'  ...in these States
@minFlowValue = 100         ...with a current flow value >= 100  cfs
@maxFlowValue = 1000        ...with a current flow value <= 1000 cfs
URL (compact geojson output):
    http://txpub.usgs.gov/DSS/CWIS/1.0/services/request.ashx/getData?service=flow&States=ma,ny,ct&minFlowValue=10&maxFlowValue=1000

DATA SERVICE ALSO SUPPORTS THESE OUTPUT FORMATS *NOT* LISTED BELOW:
&format=geojson       - compact geojson (default)
&format=prettygeojson - indented geojson
&format=map           - webmap showing results instead of geojson - the webmap auto-updates with latest data every minute
                        super easy to add custom map of realtime data to webpage in 1-liner iFrame!

ABOVE EXAMPLE, INDENTED GEOJSON:
    http://txpub.usgs.gov/DSS/CWIS/1.0/services/request.ashx/getData?service=flow&States=ma,ny,ct&minFlowValue=10&maxFlowValue=1000&format=prettygeojson

ABOVE EXAMPLE DIRECTLY SHOWING MAP OF RESULTS:
    http://txpub.usgs.gov/DSS/CWIS/1.0/services/request.ashx/getData?service=flow&States=ma,ny,ct&minFlowValue=10&maxFlowValue=1000&format=map

*/

/*
============================================
LIST OF SUPPORTED DATA SERVICE REST PARAMETERS:
============================================
*/

--------------------------------------------
-- DATA SERVICE MODE
--------------------------------------------
-- service type, one of:
--   'site' - return site information
--   'flow' - return site information and realtime stage and flow data
--   'lake' - return site information and realtime lake elevation data
--   'well' - return site information and realtime well level data
--   'rain' - return site information and realtime rain data
-- if omitted or input NULL, set to 'site'
@service nvarchar(50) = NULL,


--------------------------------------------
-- GENERAL NOTE ON INPUT FILTERING PARAMETERS:
--   Multiple filter parameters use INTERSECT set logic (AND, not OR).
--   Therefore, specifying mulitple filters where the results of each are disjoint leads to an empty overall result set.
--   For example, specifying the State Texas (@States='tx') along with a minimum longitute north of Texas (@minLatitude=40)
--   will result in empty output because no sites satisfy BOTH conditions.
--------------------------------------------

--------------------------------------------
-- SITE SELECTION (available for all service modes)
--------------------------------------------

-- ....................
-- site selection: bounding box

-- lon-lat bounding box filter (numbers):
--   none, any, or all can be specified
--   ones omitted or input NULL are left unrestricted
@minLongitude float = NULL,
@maxLongitude float = NULL,
@minLatitude  float = NULL,
@maxLatitude  float = NULL,

-- ....................
-- site selection: csv list

-- GENERAL NOTE ON CSV LIST FILTERING PARAMETERS:
--   All csv list filter parameters accept 1 or more comma-separated values, like @States='tx' or @States='tx,ca,fl'
--   Multiple comma-separated vaues use UNION set logic (OR, not AND).
--   Examples:
--   @States='tx'       returns results for Texas (that also meet other specified filting criteria).
--   @States='tx,ca,fl' returns results for Texas, California, and Florida.
--   @States='xx'       returns no results (non existant State).
--   @States='xx,tx'    returns results for Texas (empty result set for non existant State unioned with non-empty result set).

-- Site Number filter: csv list (string) or 1 or more
--   if omitted or input NULL, this filter is not applied
-- EXAMPLE: '07299840,08082800,07312000'
@SiteNumbers nvarchar(max) = NULL,

-- State filter: csv list (string) of 1 or more 2-letter State abbreviations
--   if omitted or input NULL, this filter is not applied
-- EXAMPLE: 'tx,ca,de'
@States nvarchar(max) = NULL,

-- State-County filter: csv list (string) of 1 or more 2-letter State abbreviation + county code
--   if omitted or input NULL, this filter is not applied
-- EXAMPLE: 'TX453,AL005' (Travis County, TX and Barbour County, AL)
@StateCounties nvarchar(max) = NULL,

-- HUC8 filter: csv list (string) of 1 or more 8-digit HUCs
--   if omitted or input NULL, this filter is not applied
-- EXAMPLE: '11120201,12060101,11130206'
@HUC8s nvarchar(max) = NULL,

-- Major Site Type filter: csv list (string) of 1 or more major SiteTypes
--   MajorSiteType filter matches only the major type (1st 2 characters)
--   if omitted or input NULL, this filter is not applied
-- EXAMPLE: 'ST,LK'
@MajorSiteTypes nvarchar(max) = NULL,

-- Site Type filter: csv list (string) of 1 or more SiteTypes
--   SiteType filter matches entire SiteType (major and minor types)
--   if omitted or input NULL, this filter is not applied
-- EXAMPLE: 'ST-CA,ST-TS,FA-DV'
@SiteTypes nvarchar(max) = NULL,

-- Parameter Code filter: csv list (string) of 1 or more NWIS parameter codes
--   output will be filtered for sites that have current value(s) for at least 1 (not necessarily all) of the specified parameter code(s)
--   note that CWIS only stores data for a select subset of all NWIS parameter codes
--   if omitted or input NULL, this filter is not applied
-- EXAMPLE: '00060,00010,00400' -- return only sites that have current flow, water temperature, and pH values
@ParameterCodes nvarchar(max) = NULL,

-- Data Flag filter: csv list (string) of 1 or more data flags
--   outputs sites where the specified data type have the specified data flags
--   instead of a csv list of specific flags, set to "*" to output sites that have any flag
-- EXAMPLE: 'eqp,ice' -- filter for sites whose data records have equipment or ice flags
@FlowFlags  nvarchar(max) = NULL, -- flow  values only (00060)
@StageFlags nvarchar(max) = NULL, -- stage values only (00065)
@LakeFlags  nvarchar(max) = NULL, -- lake  values only (00062)
@WellFlags  nvarchar(max) = NULL, -- well  values only (72019)
@RainFlags  nvarchar(max) = NULL, -- rain  values only (00045)
@DataFlags  nvarchar(max) = NULL, -- across all data types

-- ....................
-- site selection: min-max value

-- Gage Altitude filter: (numbers) minimum and maximum values
--   if included, output will not contain records where this field is blank or NULL
--   if omitted or input NULL, these filters are not applied
-- EXAMPLES:
--   @minGageAltitude = 100   -- output sites with GageAltitude >= 100
--   @maxGageAltitude = 1000  -- output sites with GageAltitude <= 1000
@minGageAltitude float = NULL,
@maxGageAltitude float = NULL,

-- Drainage Area filter: (numbers) minimum and maximum values
--   if included, output will not contain records where this field is blank or NULL
--   if omitted or input NULL, these filters are not applied
-- EXAMPLES:
--   @minDrainageArea = 100   -- output sites with DrainageArea >= 100
--   @maxDrainageArea = 1000  -- output sites with DrainageArea <= 1000
@minDrainageArea float = NULL,
@maxDrainageArea float = NULL,

-- Contributin gDrainage Area filter: (numbers) minimum and maximum values
--   if included, output will not contain records where this field is blank or NULL
--   if omitted or input NULL, these filters are not applied
-- EXAMPLES:
--   @minContributingDrainageArea = 100   -- output sites with ContributingDrainageArea >= 100
--   @maxContributingDrainageArea = 1000  -- output sites with ContributingDrainageArea <= 1000
@minContributingDrainageArea float = NULL,
@maxContributingDrainageArea float = NULL,

-- Data value filters: (numbers) minimum and maximum data values for a specific data type
--   when specified, output will only contain sites that have the specified data type
--   if omitted or input NULL, these filters are not applied
-- EXAMPLES:
--   @minXxxValue = 10   -- output sites whose Xxx data value is >= 10
--   @maxXxxValue = 20.5 -- output sites whose Xxx data value is <= 20.5
-- ...flow  (00060)...
@minFlowValue  float = NULL,
@maxFlowValue  float = NULL,
-- ...stage (00065)...
@minStageValue float = NULL,
@maxStageValue float = NULL,
-- ...lake  (00062)...
@minLakeValue  float = NULL,
@maxLakeValue  float = NULL,
-- ...well  (72019)...
@minWellValue  float = NULL,
@maxWellValue  float = NULL,
-- ...rain  (00045)...
@minRainValue  float = NULL,
@maxRainValue  float = NULL,

-- Data value rate of change filters
--   when specified, output will only contain sites that have the specified data type
--   if omitted or input NULL, these filters are not applied
--   positive rates of change indicate increase while negative indicates decrease (0 indicates no change)
--   absolute value of rate-of-change is NOT used when filtering by in-max values (eg, min=1 will filter out any negative values)
--   see below for rate-of-change units
-- EXAMPLES:
--   @minXxxRateOfChange = 1 -- output sites whose Xxx data rate of change is >= 1 (any negative rates-of-change not output)
--   @maxXxxRateOfChange = 2 -- output sites whose Xxx data rate of change is <= 2 (any negative rates-of-change also output)
-- ...flow  (00060)...
@minFlowRateOfChange  float = NULL, -- UNITS: cfs per hour
@maxFlowRateOfChange  float = NULL, -- UNITS: cfs per hour
-- ...stage (00065)...
@minStageRateOfChange float = NULL, -- UNITS: feet per hour
@maxStageRateOfChange float = NULL, -- UNITS: feet per hour
-- ...lake  (00062)...
@minLakeRateOfChange  float = NULL, -- UNITS: feet per hour
@maxLakeRateOfChange  float = NULL, -- UNITS: feet per hour
-- ...well  (72019)...
@minWellRateOfChange  float = NULL, -- UNITS: inches per hour
@maxWellRateOfChange  float = NULL, -- UNITS: inches per hour
-- ...rain  (00045)...
@minRainRateOfChange  float = NULL, -- UNITS: inches per hour
@maxRainRateOfChange  float = NULL, -- UNITS: inches per hour

-- Data age filters: (numbers) minimum and maximum NWISWeb data ages for a specific data type
--   when specified, output will only contain sites that have the specified data type
--   if omitted or input NULL, these filters are not applied
-- EXAMPLES:
--   @minXxxAgeHrs = 1.5  -- output sites whose Xxx data age is >= 1.5 hours 
--   @maxXxxAgeHrs = 5.5  -- output sites whose Xxx data age is <= 5.5 hours 
-- ...flow  (00060)...
@minFlowAgeHrs  float = NULL,
@maxFlowAgeHrs  float = NULL,
-- ...stage (00065)...
@minStageAgeHrs float = NULL,
@maxStageAgeHrs float = NULL,
-- ...lake  (00062)...
@minLakeAgeHrs  float = NULL,
@maxLakeAgeHrs  float = NULL,
-- ...well  (72019)...
@minWellAgeHrs  float = NULL,
@maxWellAgeHrs  float = NULL,
-- ...rain  (00045)...
@minRainAgeHrs  float = NULL,
@maxRainAgeHrs  float = NULL,
-- ...across all data types...
@minDataAgeHrs  float = NULL,
@maxDataAgeHrs  float = NULL,

-- Record last-updated filters: (UTC date-times, "mm/dd/yyyy" or "mm/dd/yyyy HH:MM:SS")
--   "last update" is the UTC date-time that a data record was updated in the database
--   datetimes with no time part ("mm/dd/yyyy") are applied at 00:00:000
--   if omitted or input NULL, these filters are not applied
-- EXAMPLES:
--   @minLastUpdatedDateXxx = '12/1/2015 13:30:00' -- output sites whose Xxx data-type record was last updated Dec 1, 2015 1:30pm (UTC) and LATER
--   @maxLastUpdatedDateXxx = '12/2/2015'          -- output sites whose Xxx data-type record was last updated Dec 2, 2015 0:00   (UTC) and EARLIER
-- ...site...
@minLastUpdatedUtcSite  datetime = NULL,
@maxLastUpdatedUtcSite  datetime = NULL,
-- ...flow  (00060)...
@minLastUpdatedUtcFlow  datetime = NULL,
@maxLastUpdatedUtcFlow  datetime = NULL,
-- ...stage (00065)...
@minLastUpdatedUtcStage datetime = NULL,
@maxLastUpdatedUtcStage datetime = NULL,
-- ...lake  (00062)...
@minLastUpdatedUtcLake  datetime = NULL,
@maxLastUpdatedUtcLake  datetime = NULL,
-- ...well  (72019)...
@minLastUpdatedUtcWell  datetime = NULL,
@maxLastUpdatedUtcWell  datetime = NULL,
-- ...rain  (00045)...
@minLastUpdatedUtcRain  datetime = NULL,
@maxLastUpdatedUtcRain  datetime = NULL,

-- Record last-updated filters: (numbers) hours since last update
--   "last update" is the UTC date-time that a data record was updated in the database
--   if omitted or input NULL, these filters are not applied
-- EXAMPLES:
--   @minLastUpdatedHrsXxx = 1.5 -- output sites whose Xxx data-type record was last updated >= 1.5 hours ago
--   @maxLastUpdatedHrsXxx = 5.5 -- output sites whose Xxx data-type record was last updated <= 5.5 hours ago
-- ...site...
@minLastUpdatedHrsSite  float = NULL,
@maxLastUpdatedHrsSite  float = NULL,
-- ...flow  (00060)...
@minLastUpdatedHrsFlow  float = NULL,
@maxLastUpdatedHrsFlow  float = NULL,
-- ...stage (00065)...
@minLastUpdatedHrsStage float = NULL,
@maxLastUpdatedHrsStage float = NULL,
-- ...lake  (00062)...
@minLastUpdatedHrsLake  float = NULL,
@maxLastUpdatedHrsLake  float = NULL,
-- ...well  (72019)...
@minLastUpdatedHrsWell  float = NULL,
@maxLastUpdatedHrsWell  float = NULL,
-- ...rain  (00045)...
@minLastUpdatedHrsRain  float = NULL,
@maxLastUpdatedHrsRain  float = NULL,

-- ....................
-- site selection: true only

-- sites that have...
--   ... computed day-of-year statistics...
--   @hasFlowStats ....... computed flow  statistics (00060)
--   @hasStageStats ...... computed stage statistics (00065)
--   @hasLakeStats ....... computed lake  statistics (00062)
--   @hasWellStats ....... computed well  statistics (72019)
--   @hasRainStats ....... computed rain  statistics (00045)
--   ...misc...
--   @hasFloodStage ...... flood stage defined
-- when 'true', sites returned have specified data type
-- if omitted or set NULL, these filters are not applied
-- these options may only be set 'true', NULL, or omitted - 'false' is NOT supported
@hasFlowStats  nvarchar(5) = NULL,
@hasStageStats nvarchar(5) = NULL,
@hasLakeStats  nvarchar(5) = NULL,
@hasWellStats  nvarchar(5) = NULL,
@hasRainStats  nvarchar(5) = NULL,

@hasFloodStage nvarchar(5) = NULL,

-- ....................
-- site selection: true-false

-- isMinorFloodStage, either:
--   'true'  : return sites where current stage is >= minor flood stage
--   'false' : return sites where current stage is <  minor flood stage
-- when 'true' or 'false', sites with no current stage or minor flood stage are not returned
-- if omitted, input NULL, or not 'true' or 'false' this filter is not applied
@isMinorFloodStage nvarchar(5) = NULL,

-- ....................
-- site selection: geospatial

-- polygon filter: csv string of lon-lat coordinate pairs of polygon vertices: 'lon1,lat1; lon2,lat2; ...'
--   use commas between lon and lat, separate lon-lat pairs with semicolons
--   the coordinate pairs must be ordered around the polygon (clockwise or counterclockwise)
--   the polygon does not need to be closed (1st and last coords the same) - it will be closed for you
--   if omitted or input NULL, this filter is not applied
-- EXAMPLE: '-88,32;-84,32;-84,36;-88,36' (rectangle, but can have any geometry and number of vertices)
@inPolygonCoords nvarchar(max) = NULL,

-- lon-lat point and radius filter: csv string of 'lon,lat,radius_miles'
--   if omitted or input NULL, this filter is not applied
-- EXAMPLE: '-96,35,100' (centered at [-96,35] with 100 mile radius)
@inLonLatRadius nvarchar(50) = NULL,

--------------------------------------------
-- OUTPUT OPTIONS
--------------------------------------------

-- options for fields to output (string)
--   pre-defined options:
--     'minimum' : [Latitude], [Longitude], [SiteNumber], [SiteName]
--       'short' : [Latitude], [Longitude], [SiteNumber], [SiteName], [SiteTypeGroup], [SiteTypeName]
--     'summary' : [Latitude], [Longitude], [SiteNumber], [SiteName], [SiteTypeGroup], [SiteTypeName] and additional, commonly useful site-summary fields
--        'long' : same as 'summary' plus all Site table records
--
--   additionally, can be set to a custom csv list of **Site** table field names to output
--     [Latitude], [Longitude], and [SiteNumber] are always output
--     the additional Site table fields output defined in the csv list will have the same letter casing as in the csv list
--     if a specified column does not exist in the Site table, an error similar to this is returned:
--     +--------------------------------------------------------------------------------------------------------+
--     | ERROR                                                                                                  |
--     +--------------------------------------------------------------------------------------------------------+
--     | custom output using 'outSiteInfo' option: invalid site table column: 'NON_EXISTANT_SITE_TABLE_COLUMN'. |
--     +--------------------------------------------------------------------------------------------------------+
--     EXAMPLE: 'RecordInterval,ContributingDrainageArea' (also outputs [Latitude], [Longitude], and [SiteNumber])
--
--   if this option is omitted or input NULL, one of the pre-defined options is set based on the specified @service type
@outSiteInfo nvarchar(max) = NULL,

-- output time zone to use for all reported date times
--   when specified, must be either:
--   'local' : report in the local time zone of the site (eg: '2015-10-09 17:00:00 EST')
--             multiple time zones will be reported for sites spanning multiple time zones
--   'utc'   : report in UTC (eg: '2015-10-09 22:00:00 UTC')
--             the same UTC time zone used for all sites regardless of time zone
--   if omitted or input NULL, set to 'local'
@outTimeZone nvarchar(5) = NULL,

-- what to output missing values as
--   set to 'dbnull' to output missing values as database NULLs
--   if omitted or input NULL, set to 'N/A'
@outMissingVal nvarchar(max) = NULL,

-- restrict max number of records returned
--   output is sorted by site number
--   if omitted or input NULL, an internal maximum is applied
--   if input and above the internal maximum, it is reset to the internal maximum
-- EXAMPLE: 50 -- return at most 50 sites
@outMaxRecords int = NULL,

/*
============================================
END SUPPORTED DATA SERVICE REST PARAMETERS
============================================
*/
