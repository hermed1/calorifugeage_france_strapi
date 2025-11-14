'use strict';

/**
 * upload-checklist service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::upload-checklist.upload-checklist');
