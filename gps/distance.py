import math

def haversine(lat1, lon1, lat2, lon2):
    # Convert decimal degrees to radians.
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Compute differences.
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    # Haversine formula.
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of Earth in kilometers (use 3956 for miles)
    r = 6371
    return c * r

# Example usage:
lat1, lon1 = 53.35334266666667, -6.270104666666667 
lat2, lon2 = 53.35348066666667, -6.270213833333333   

distance = haversine(lat1, lon1, lat2, lon2)
print(f"Distance: {distance:.2f} km")
