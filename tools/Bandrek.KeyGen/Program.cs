using System.Text;
using System.Text.RegularExpressions;

namespace Bandrek.KeyGen;

public static class Program
{
    private const string Crockford = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

    public static void Main(string[] args)
    {
        Console.OutputEncoding = Encoding.UTF8;

        if (args.Length > 0)
        {
            var input = string.Join(" ", args).Trim();
            ProcessInput(input);
            return;
        }

        // Interactive mode
        PrintHeader();

        while (true)
        {
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.Write("\nMasukkan URL Server atau Kode Serial (ketik 'exit' untuk keluar):\n> ");
            Console.ResetColor();

            var line = Console.ReadLine();
            if (string.IsNullOrWhiteSpace(line)) continue;
            if (line.Trim().Equals("exit", StringComparison.OrdinalIgnoreCase) ||
                line.Trim().Equals("q", StringComparison.OrdinalIgnoreCase))
            {
                break;
            }

            ProcessInput(line.Trim());
        }
    }

    private static void PrintHeader()
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("==============================================================");
        Console.WriteLine("   BANDREK SERVER CONNECTION CODE / SERIAL GENERATOR (CLI)    ");
        Console.WriteLine("==============================================================");
        Console.ResetColor();
        Console.WriteLine("Alat ini mengubah URL Server (misal http://103.187.146.20:5050)");
        Console.WriteLine("menjadi Kode Koneksi bergaya Serial Windows (5x5 karakter) dan sebaliknya.");
    }

    private static void ProcessInput(string input)
    {
        // Detect if input is already a serial key or URL
        if (input.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            input.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            var serial = EncodeServerUrl(input);
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("✓ SERIAL CODE HASIL ENCODE:");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine($"  {serial}");
            Console.ResetColor();
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine($"  Target URL : {input}");
            Console.ResetColor();
        }
        else
        {
            // Try decoding as serial key first
            var decoded = DecodeServerUrl(input);
            if (!string.IsNullOrEmpty(decoded) &&
                (decoded.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                 decoded.StartsWith("https://", StringComparison.OrdinalIgnoreCase)))
            {
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("✓ HASIL DECODE SERIAL CODE:");
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine($"  {decoded}");
                Console.ResetColor();
            }
            else
            {
                // Fallback: Treat as a URL missing scheme or generic string
                var urlCandidate = input.Contains(':') || input.Contains('.') ? "http://" + input : input;
                var serial = EncodeServerUrl(urlCandidate);
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("✓ SERIAL CODE HASIL ENCODE (diasumsikan http://):");
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine($"  {serial}");
                Console.ResetColor();
                Console.ForegroundColor = ConsoleColor.DarkGray;
                Console.WriteLine($"  Target URL : {urlCandidate}");
                Console.ResetColor();
            }
        }
    }

    public static string EncodeServerUrl(string url)
    {
        try
        {
            var clean = url.Trim().TrimEnd('/');
            if (string.IsNullOrEmpty(clean)) return string.Empty;

            var match = Regex.Match(clean, @"^(https?):\/\/([^:/]+)(?::(\d+))?$", RegexOptions.IgnoreCase);
            var bytes = new List<byte>();

            if (match.Success)
            {
                var isHttps = match.Groups[1].Value.Equals("https", StringComparison.OrdinalIgnoreCase);
                var host = match.Groups[2].Value;
                var port = match.Groups[3].Success ? int.Parse(match.Groups[3].Value) : (isHttps ? 443 : 80);

                byte[]? ipParts = null;
                var isLocalhost = host.Equals("localhost", StringComparison.OrdinalIgnoreCase);
                if (isLocalhost)
                {
                    ipParts = [127, 0, 0, 1];
                }
                else
                {
                    var segs = host.Split('.');
                    if (segs.Length == 4 && segs.All(s => byte.TryParse(s, out _)))
                    {
                        ipParts = segs.Select(byte.Parse).ToArray();
                    }
                }

                if (ipParts != null)
                {
                    bytes.Add((byte)(0x80 | (isHttps ? 0x40 : 0) | (isLocalhost ? 0x20 : 0) | 1));
                    bytes.AddRange(ipParts);
                    bytes.Add((byte)((port >> 8) & 0xff));
                    bytes.Add((byte)(port & 0xff));
                }
                else
                {
                    var hostBuf = Encoding.UTF8.GetBytes(host);
                    if (hostBuf.Length <= 10)
                    {
                        bytes.Add((byte)(0x40 | (isHttps ? 0x20 : 0) | (hostBuf.Length & 0x1f)));
                        bytes.Add((byte)((port >> 8) & 0xff));
                        bytes.Add((byte)(port & 0xff));
                        bytes.AddRange(hostBuf);
                    }
                    else
                    {
                        bytes.Add((byte)(isHttps ? 0x02 : 0x01));
                        bytes.Add((byte)((port >> 8) & 0xff));
                        bytes.Add((byte)(port & 0xff));
                        bytes.Add((byte)hostBuf.Length);
                        bytes.AddRange(hostBuf);
                    }
                }
            }
            else
            {
                bytes.Add(0x00);
                bytes.AddRange(Encoding.UTF8.GetBytes(clean));
            }

            // Pad to 14 data bytes if shorter
            if (bytes.Count < 14)
            {
                bytes.Add(0xfe);
                byte seed = 0x5a;
                foreach (var b in bytes) seed = (byte)((seed * 33 + b) & 0xff);
                while (bytes.Count < 14)
                {
                    seed = (byte)((seed * 33 + 7) & 0xff);
                    bytes.Add(seed);
                }
            }

            // Checksum XOR
            byte chk = 0xa5;
            foreach (var b in bytes) chk = (byte)((chk ^ b) & 0xff);
            bytes.Add(chk);

            // Encode to Crockford Base32
            int bits = 0;
            long val = 0;
            var chars = new StringBuilder();
            foreach (var b in bytes)
            {
                val = (val << 8) | b;
                bits += 8;
                while (bits >= 5)
                {
                    bits -= 5;
                    chars.Append(Crockford[(int)((val >> bits) & 0x1f)]);
                }
            }

            if (bits > 0)
            {
                chars.Append(Crockford[(int)((val << (5 - bits)) & 0x1f)]);
            }

            // If 24 chars, append parity/check char to make exactly 25 chars (5 groups of 5)
            if (chars.Length == 24)
            {
                int sum = 0;
                for (int i = 0; i < chars.Length; i++)
                {
                    sum = (sum * 3 + Crockford.IndexOf(chars[i])) % 32;
                }
                chars.Append(Crockford[sum]);
            }

            var rawChars = chars.ToString();
            var chunks = new List<string>();
            for (int i = 0; i < rawChars.Length; i += 5)
            {
                chunks.Add(rawChars.Substring(i, Math.Min(5, rawChars.Length - i)));
            }

            return string.Join("-", chunks);
        }
        catch
        {
            return string.Empty;
        }
    }

    public static string DecodeServerUrl(string code)
    {
        try
        {
            var trimmed = code.Trim();
            if (string.IsNullOrEmpty(trimmed)) return string.Empty;
            if (trimmed.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                trimmed.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                return trimmed;
            }

            var clean = Regex.Replace(trimmed, @"[-\s]", "").ToUpperInvariant();
            clean = clean.Replace('O', '0').Replace('I', '1').Replace('L', '1');

            if (clean.Length == 25)
            {
                int sum = 0;
                for (int i = 0; i < 24; i++)
                {
                    sum = (sum * 3 + Crockford.IndexOf(clean[i])) % 32;
                }
                if (Crockford.IndexOf(clean[24]) == sum)
                {
                    clean = clean.Substring(0, 24);
                }
            }

            int bits = 0;
            long val = 0;
            var bytes = new List<byte>();
            foreach (var c in clean)
            {
                var idx = Crockford.IndexOf(c);
                if (idx == -1) throw new InvalidOperationException("Invalid Crockford character: " + c);
                val = (val << 5) | (long)idx;
                bits += 5;
                while (bits >= 8)
                {
                    bits -= 8;
                    bytes.Add((byte)((val >> bits) & 0xff));
                }
            }

            if (bytes.Count >= 2)
            {
                var chk = bytes[^1];
                bytes.RemoveAt(bytes.Count - 1);

                byte expectedChk = 0xa5;
                foreach (var b in bytes) expectedChk = (byte)((expectedChk ^ b) & 0xff);

                if (chk == expectedChk)
                {
                    var feIdx = bytes.IndexOf(0xfe);
                    var data = feIdx != -1 ? bytes.Take(feIdx).ToArray() : bytes.ToArray();

                    var header = data[0];
                    if ((header & 0x80) != 0)
                    {
                        var isHttps = (header & 0x40) != 0;
                        var isLocalhost = (header & 0x20) != 0;
                        var ip = $"{data[1]}.{data[2]}.{data[3]}.{data[4]}";
                        var port = (data[5] << 8) | data[6];
                        var host = isLocalhost ? "localhost" : ip;
                        var defaultPort = isHttps ? 443 : 80;
                        return $"{ (isHttps ? "https" : "http") }://{host}{(port == defaultPort ? "" : ":" + port)}";
                    }
                    if ((header & 0x40) != 0)
                    {
                        var isHttps = (header & 0x20) != 0;
                        var len = header & 0x1f;
                        var port = (data[1] << 8) | data[2];
                        var host = Encoding.UTF8.GetString(data, 3, len);
                        var defaultPort = isHttps ? 443 : 80;
                        return $"{ (isHttps ? "https" : "http") }://{host}{(port == defaultPort ? "" : ":" + port)}";
                    }
                    if (header == 0x01 || header == 0x02)
                    {
                        var isHttps = header == 0x02;
                        var port = (data[1] << 8) | data[2];
                        var len = data[3];
                        var host = Encoding.UTF8.GetString(data, 4, len);
                        var defaultPort = isHttps ? 443 : 80;
                        return $"{ (isHttps ? "https" : "http") }://{host}{(port == defaultPort ? "" : ":" + port)}";
                    }
                    if (header == 0x00)
                    {
                        return Encoding.UTF8.GetString(data, 1, data.Length - 1);
                    }
                }
            }

            // Fallback base64
            var b64Bytes = Convert.FromBase64String(trimmed);
            var decoded = Encoding.UTF8.GetString(b64Bytes);
            if (decoded.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                decoded.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                return decoded;
            }
        }
        catch
        {
            // Ignore decode failures
        }

        return string.Empty;
    }
}
