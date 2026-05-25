exports.handler = async function(event) {
  try {
    const q = event.queryStringParameters || {};
    const base = (q.base || '').replace(/\/+$/,'');
    const username = q.username || '';
    const password = q.password || '';
    const action = q.action || '';
    const extra = q.extra || '';

    if (!base || !username || !password || !action) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing base, username, password, or action' })
      };
    }

    let url;

    if (action === 'user_info') {
      url = `${base}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    } else {
      url = `${base}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${encodeURIComponent(action)}`;
    }

    if (extra) {
      url += `&${extra}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'IPTVSmarters/1.0 Mozilla/5.0',
        'Accept': 'application/json,text/plain,*/*'
      },
      redirect: 'follow'
    });

    const body = await response.text();

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      parsed = null;
    }

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Provider HTTP error',
          provider_status: response.status,
          body: body.slice(0, 500)
        })
      };
    }

    if (!parsed) {
      return {
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Provider did not return JSON',
          body: body.slice(0, 500)
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(parsed)
    };

  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: e.message })
    };
  }
};
