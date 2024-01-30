# anyerr

Get the message from any error of all shapes and sizes! Anyerr will traverse
through deeply-nested error objects to find the error message.

```typescript
import { parseAnyError } from '../src/index';
import axios from 'axios';

async function doSomething() {
  try {
    await axios.get('http://example.com');
  } catch (ex) {
    const { message } = parseAnyError(ex);
    console.error('Error while doing something:', message);
  }
}
```

<table>
<tr>
<th>
Example error
</th>
<th>
Output
</th>
</tr>

<tr>
<td>
<pre lang="json">
{
  "ok": false,
  "data": {
    "error": {
      "code": 500,
      "message": {
        "detail": "Uh-oh, an oopsie-whoopsie has happened"
      }
    }
  }
}
</pre>
</td>
<td>
<pre>Uh-oh, an oopsie-whoopsie has happened</pre>
</td>
</tr>

<tr>
<td>
<pre lang="json">
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "00-0b1f1c9a0a1b4f4e9f3b9b9b0a1b4f4e",
  "errors": {
    "name": [
      "The Name field is required."
    ]
  }
}
</pre>
</td>
<td>
<pre>The Name field is required.</pre>
</td>
</tr>

</table>
