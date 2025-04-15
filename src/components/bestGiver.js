export let bestGiver = { address: "", coins: 0 };

export async function updateBestGivers(givers) {
  const giver = givers.data[Math.floor(Math.random() * givers.data.length)];
  bestGiver = {
    address: giver.address,
    coins: giver.reward,
  };
}
