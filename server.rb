require 'webrick'

port = 8080
root = File.expand_path(File.dirname(__FILE__))

# Create a WEBrick HTTP Server with MIME types support
mime_types = WEBrick::HTTPUtils::DefaultMimeTypes.merge(
  'js' => 'application/javascript',
  'mjs' => 'application/javascript',
  'css' => 'text/css',
  'html' => 'text/html'
)

server = WEBrick::HTTPServer.new(
  Port: port,
  DocumentRoot: root,
  MimeTypes: mime_types,
  Logger: WEBrick::Log.new($stderr, WEBrick::Log::WARN),
  AccessLog: []
)

trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }

puts "FinanceFlow Server running at http://localhost:#{port}/"
server.start
