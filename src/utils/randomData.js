export const randomString = length =>  {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const charactersLength = characters.length
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const randomNumber = (min = 0, max = 99) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const randomWords = (repeat = 5) => {
  let output = ''
  for (let i = 0; i < repeat; i++) {
    output += randomWordsList[randomNumber(0, randomWordsList.length - 1)] + ' '
  }
  return output
}

export const randomWordsList = [
  'hello',
  'world',
  'nice',
  'fruit',
  'you',
  'strong',
  'top',
  'word',
  'sea',
  'awesome',
  'go',
  'travel'
]

export const randomBoolean = () => {
  return !!randomNumber(0, 1)
}

export const randomArray = () => {
  const array = randomWordsList.slice(0, randomNumber(0, randomWordsList.length - 1))
  let currentIndex = array.length
  let randomIndex = 0
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
  return array
}

export const randomEntity = () => {
  const fieldsNumber = randomNumber(1, 5)
  const randomFunctions = [randomArray, randomBoolean, randomNumber, randomString, randomWords]
  const entity = {}
  for (let i = 0; i < fieldsNumber; i++) {
    const randomIndexWord = randomNumber(0, randomWordsList.length - 1)
    const randomFunctionIndex = randomNumber(0, randomFunctions.length - 1)
    entity.id = randomNumber()
    entity[randomWordsList[randomIndexWord]] = randomFunctions[randomFunctionIndex]()
  }
  return entity
}

export const mockDataHooks = {
  string: randomWords,
  number: randomNumber,
  boolean: randomBoolean,
  object: randomEntity,
  array: randomArray,
  null: () => null
}
