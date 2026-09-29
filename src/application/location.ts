export type Coordinates = { latitude: number; longitude: number };

export function requestCurrentLocation(geolocation: Geolocation | undefined = typeof navigator !== 'undefined' ? navigator.geolocation : undefined): Promise<Coordinates> {
  if (!geolocation) return Promise.reject(new Error('現在地を取得できませんでした。場所を手入力してください'));
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => reject(new Error('現在地を取得できませんでした。場所を手入力してください')),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });
}
