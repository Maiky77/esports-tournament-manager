const characters = {
  ...Object.fromEntries(
    ['hirara', 'kalea', 'marcel', 'obsidia', 'sora', 'zetian'].map((name) => [
      name, { src: `/${name}.webp`, width: 750, height: 721, game: 'mlbb' },
    ]),
  ),
  deeee: { src: '/img/deeee.webp', width: 1029, height: 1600, game: 'ff' },
  miguel: { src: '/img/miguel.webp', width: 863, height: 1600, game: 'ff' },
  moco: { src: '/img/moco-de-free-fire.png', width: 150, height: 150, game: 'ff' },
  mono: { src: '/img/mono%20freefire.webp', width: 1100, height: 1600, game: 'ff' },
  rafael: { src: '/img/rafael.webp', width: 1162, height: 1600, game: 'ff' },
  tiradora: { src: '/img/tiradora.webp', width: 1133, height: 1600, game: 'ff' },
}

function CharacterArt({ character, className = '', priority = false }) {
  const asset = characters[character]
  if (!asset) return null

  return (
    <div className={`character-art character-art--${asset.game} character-art--${character} ${className}`} aria-hidden="true">
      <span className="character-art__aura" />
      <img
        className="character-art__image"
        src={asset.src}
        alt=""
        width={asset.width}
        height={asset.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable="false"
      />
    </div>
  )
}

export default CharacterArt
