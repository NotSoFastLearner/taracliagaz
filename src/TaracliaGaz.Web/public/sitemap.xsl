<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="ru">
      <head>
        <title>Карта сайта (Sitemap) — SRL «Taraclia-Gaz»</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1a202c;
            background: #f8f9fa;
            margin: 0;
            padding: 24px 16px;
          }
          .container {
            max-width: 1040px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
            overflow: hidden;
          }
          .header {
            padding: 28px 32px 20px;
            background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
            border-bottom: 1px solid #e2e8f0;
          }
          h1 {
            font-size: 22px;
            font-weight: 700;
            color: #0057b8;
            margin: 0 0 6px 0;
          }
          .desc {
            color: #64748b;
            font-size: 14px;
            margin: 0 0 14px 0;
          }
          .badge-count {
            display: inline-block;
            background: #e0f2fe;
            color: #0369a1;
            font-weight: 600;
            font-size: 13px;
            padding: 4px 10px;
            border-radius: 6px;
          }
          .table-wrapper {
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            text-align: left;
          }
          th {
            background: #f8fafc;
            color: #475569;
            padding: 12px 16px;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 10px 16px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }
          tr:hover td {
            background: #f8fafc;
          }
          a {
            color: #0057b8;
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            background: #f1f5f9;
            color: #475569;
          }
          .date {
            color: #64748b;
            font-size: 12px;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Карта сайта / Harta site-ului</h1>
            <p class="desc">
              XML Sitemap для SRL «Taraclia-Gaz». Этот документ содержит актуальные ссылки на страницы сайта для поисковых систем и пользователей.
            </p>
            <span class="badge-count">
              Всего ссылок: <xsl:value-of select="count(s:urlset/s:url)"/>
            </span>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width: 55%;">URL</th>
                  <th style="width: 15%; text-align: center;">Приоритет</th>
                  <th style="width: 15%; text-align: center;">Период</th>
                  <th style="width: 15%; text-align: right;">Обновлено</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td>
                      <a href="{s:loc}">
                        <xsl:value-of select="s:loc"/>
                      </a>
                    </td>
                    <td style="text-align: center;">
                      <span class="badge"><xsl:value-of select="s:priority"/></span>
                    </td>
                    <td style="text-align: center;">
                      <xsl:if test="s:changefreq">
                        <span class="badge"><xsl:value-of select="s:changefreq"/></span>
                      </xsl:if>
                    </td>
                    <td style="text-align: right;" class="date">
                      <xsl:value-of select="s:lastmod"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
