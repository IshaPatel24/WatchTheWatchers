import time
from fastapi import Request, HTTPException, status

class TokenBucketLimiter:
    def __init__(self, rate: float, capacity: float):
        """
        rate: Number of tokens added per second
        capacity: Maximum number of tokens in the bucket
        """
        self.rate = rate
        self.capacity = capacity
        self.buckets = {}

    def _get_bucket(self, key: str):
        now = time.time()
        if key not in self.buckets:
            self.buckets[key] = {"tokens": self.capacity, "last_updated": now}
        else:
            # Refill tokens based on elapsed time
            elapsed = now - self.buckets[key]["last_updated"]
            added_tokens = elapsed * self.rate
            self.buckets[key]["tokens"] = min(self.capacity, self.buckets[key]["tokens"] + added_tokens)
            self.buckets[key]["last_updated"] = now
        
        return self.buckets[key]

    def consume(self, key: str, amount: float = 1.0) -> bool:
        bucket = self._get_bucket(key)
        if bucket["tokens"] >= amount:
            bucket["tokens"] -= amount
            return True
        return False

# In-memory limiter instance: capacity = 3 requests, refills at 0.1 tokens/sec (1 token every 10s)
limiter = TokenBucketLimiter(rate=0.1, capacity=3.0)

def rate_limit(request: Request):
    # Retrieve client IP as the identifier key
    client_ip = request.client.host if request.client else "unknown_ip"
    if not limiter.consume(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="RATE LIMIT EXCEEDED: MAXIMUM ANONYMOUS BANDWIDTH EXHAUSTED. RETRY IN 10 SECONDS."
        )
    return client_ip
