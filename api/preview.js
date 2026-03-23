export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL obrigatoria' });

  try {
    const r1 = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });

    const finalUrl = r1.url;
    const html = await r1.text();

    const getMeta = (patterns) => {
      for (const p of patterns) {
        const m = html.match(p);
        if (m && m[1] && m[1].length > 2) return decodeHtml(m[1].trim());
      }
      return '';
    };

    const title = getMeta([
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{5,})["']/i,
      /<meta[^>]+content=["']([^"']{5,})["'][^>]+property=["']og:title["']/i,
      /<title[^>]*>([^<]{5,})<\/title>/i,
      /"name"\s*:\s*"([^"]{5,})"/,
      /"title"\s*:\s*"([^"]{5,})"/
    ]);

    const image = getMeta([
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /"image"\s*:\s*"([^"]+\.jpg[^"]*)"/i
    ]);

    let imageUrl = image;
    if (image && !image.startsWith('http') && image.length > 10) {
      imageUrl = 'https://down-br.img.susercontent.com/file/' + image;
    }

    const preco = getMeta([
      /"price"\s*:\s*"?([\d.,]+)"?/,
      /R\$\s*([\d.,]+)/
    ]);

    const precoDe = getMeta([
      /"originalPrice"\s*:\s*"?([\d.,]+)"?/,
      /"priceBeforeDiscount"\s*:\s*"?([\d.,]+)"?/
    ]);

    return res.status(200).json({
      title: title || '',
      image: imageUrl || '',
      preco: preco ? 'R$ ' + preco : '',
      precoDe: precoDe ? 'R$ ' + precoDe : '',
      finalUrl
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ');
}
