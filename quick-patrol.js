// ==UserScript==
// @name         Quick Patrol
// @namespace    http://rabbi.town/
// @version      0.1
// @description  Quick Patrol in MediaWiki
// @author       Milkory
// @match        *://*.huijiwiki.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let mwApi;

  window.addEventListener('load', init, false);

  async function init() {
    mwApi = new mw.Api();
    let rights = (
      await mwApi.get({
        action: 'query',
        meta: 'userinfo',
        uiprop: 'rights',
      })
    ).query.userinfo.rights;

    if (rights.includes('patrol')) {
      $('.mw-changeslist-unpatrolled').attr('data-mw-revid', function (_i, value) {
        $(this)
          .find('.unpatrolled')
          .css('cursor', 'pointer')
          .attr('title', 'Click to partoll')
          .click(function () {
            let me = $(this);
            if ($(this).text() == '!') {
              $(this).text('~').css('color', 'darkgreen').attr('title', 'Patrolling...');
              patrol(
                value,
                function () {
                  me.text('✔')
                    .css({
                      'text-decoration': 'none',
                      'border-bottom': 'none',
                      color: 'green',
                      cursor: 'default',
                    })
                    .attr('title', 'Successfully partolled');
                },
                function () {
                  console.log(`[QuickPatrol] 巡查失败 (revid: ${value})`);
                  $(this).text('!').css('color', 'red').attr('title', 'Click to partol');
                }
              );
            }
          });
        return value;
      });
    }
  }

  function patrol(revid, successFallback, failFallback) {
    mwApi
      .get({
        action: 'query',
        meta: 'tokens',
        type: 'patrol',
        format: 'json',
      })
      .done(function (data) {
        console.log(`[QuickPatrol] 尝试巡查 (revid: ${revid})`);
        mwApi
          .post({
            action: 'patrol',
            revid: revid,
            token: data.query.tokens.patroltoken,
            format: 'json',
          })
          .done(function () {
            console.log(`[QuickPatrol] 巡查成功 (revid: ${revid})`);
            successFallback();
          })
          .fail(failFallback);
      })
      .fail(failFallback);
  }
})();
