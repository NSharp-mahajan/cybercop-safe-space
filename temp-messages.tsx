{chat?.messages?.map((message) => (
  <div
    key={message.id}
    className="flex flex-col gap-6 py-4 px-4"
  >
    <div 
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } px-0`}
    >
      <div
        className={`relative max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50'
        }`}
        style={{
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          wordBreak: 'break-word'
        }}
      >
        {message.message}
      </div>
    </div>
  </div>
))}