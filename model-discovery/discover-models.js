'use strict';

const loopback = require('loopback');
const promisify = require('util').promisify;
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdirp = promisify(require('mkdirp'));

const DATASOURCE_NAME = 'postgresDS';
const dataSourceConfig = require('/Users/silvanhuber/Documents/Loopback/redmaplelb/server/datasources.json');
const db = new loopback.DataSource(dataSourceConfig[DATASOURCE_NAME]);

discover().then(
  success => process.exit(),
  error => { console.error('UNHANDLED ERROR:\n', error); process.exit(1); },
);

async function discover() {
  // It's important to pass the same "options" object to all calls
  // of dataSource.discoverSchemas(), it allows the method to cache
  // discovered related models
  const options = {relations: true};

  // Discover models and relations
  const dnaSecSchema = await db.discoverSchemas('tbl_dna_seq', options);
  const dnaExtractionSchema = await db.discoverSchemas('tbl_dna_extraction', options);
  const ngsSchema = await db.discoverSchemas('tbl_ngs', options);
  const probeEingangSchema = await db.discoverSchemas('tbl_probe_eingang', options);
  const patientSchema = await db.discoverSchemas('tbl_patient', options);
  const pathogenSchema = await db.discoverSchemas('tbl_pathogen', options);


  // Create model definition files 
  await mkdirp('common/models');
  await writeFile(
    'common/models/TblDnaSeq.json',
    JSON.stringify(dnaSecSchema['public.tbl_dna_seq'], null, 2)
  );
  await writeFile(
    'common/models/TblDnaExtraction.json',
    JSON.stringify(dnaExtractionSchema['public.tbl_dna_extraction'], null, 2)
  );
  await writeFile(
    'common/models/TblNgs.json',
    JSON.stringify(ngsSchema['public.tbl_ngs'], null, 2)
  );
  await writeFile(
    'common/models/TblProbeEingang.json',
    JSON.stringify(probeEingangSchema['public.tbl_probe_eingang'], null, 2)
  );
  await writeFile(
    'common/models/TblPatient.json',
    JSON.stringify(patientSchema['public.tbl_patient'], null, 2)
  );
  await writeFile(
    'common/models/TblPathogen.json',
    JSON.stringify(pathogenSchema['public.tbl_pathogen'], null, 2)
  );


  // Expose models via REST API
  const configJson = await readFile('server/model-config.json', 'utf-8');
  console.log('MODEL CONFIG', configJson);
  const config = JSON.parse(configJson);
  config.TblDnaSeq = {dataSource: DATASOURCE_NAME, public: true};
  config.TblDnaExtraction = {dataSource: DATASOURCE_NAME, public: true};
  config.TblNgs = {dataSource: DATASOURCE_NAME, public: true};
  config.TblProbeEingang = {dataSource: DATASOURCE_NAME, public: true};
  config.TblPatient = {dataSource: DATASOURCE_NAME, public: true};
  config.TblPathogen = {dataSource: DATASOURCE_NAME, public: true};

  await writeFile(
    'server/model-config.json',
    JSON.stringify(config, null, 2)
  );
}