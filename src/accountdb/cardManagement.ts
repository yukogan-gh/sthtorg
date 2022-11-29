import { prisma } from './prisma.server';

export async function createUserCard(title: string, name: string, cb: Function) {
  let userExists = await prisma.user.findUnique({
    where: {
      name,
    },
  });
  if (!userExists) {
    cb('Unexpected error', null);
    return;
  }
  let cardExists = await prisma.card.findUnique({
    where: {
        name: title
    }
  });
  if (cardExists) {
    cb('This card already exists', null);
    return;
  }
  let card = await prisma.card.create({
    data: {
      authorId: userExists.id,
      name: title
    }
  });

  const cardsByUser = await prisma.card.findMany({
    where: { authorId: userExists.id },
  });
  cb(null, card);
  console.log(cardsByUser);
}

export async function createTerm(term: string, definition: string, userName: string, cardId: number, cb: Function) {
  let userExists = await prisma.user.findUnique({
    where: {
      name: userName
    }
  });
  if (!userExists) {
    cb('Unexpected error (no such user)', null);
    return;
  }
  let cardExists = await prisma.card.findUnique({
    where: {
      id: cardId
    }
  });
  if (!cardExists) {
    cb('Unexpected error (no such card)', null);
    return;
  }
  // let termExists = await prisma.term.findUnique({
  //   where: {
  //     term
  //   }
  // });
  // if (termExists) {
  //   cb('Term alrea')
  // }
  // let termExists = await prisma.term.findFirst({
  //   where: {
  //     term,
  //     definition
  //   }
  // });
  // if (termExists) {
  //   cb('The exact same term already exists!', null);
  //   return;
  // }
  let existingTerm = await prisma.term.create({
    data: {
      term,
      definition,
      authorId: userExists.id,
      cardId: cardExists.id
    }
  });
  // console.log(existingTerm);
  cb(null, existingTerm);
}

export async function getUserCards(name: string, cb: Function) {
  let userExists = await prisma.user.findUnique({
    where: {
      name
    }
  });
  if (!userExists) {
    cb('Unexpected error (no such user)', null);
    return;
  }
  let cards = await prisma.card.findMany({
    where: {
      authorId: userExists.id
    }
  });
  cb(null, cards);
}

export async function getCardTerms(cardId: number, cb: Function) {
  if (!cardId) {
    cb('Unexpected error (no card id provided)');
    return;
  }
  
  let cardExists = await prisma.card.findUnique({
    where: {
      id: cardId
    }
  })/*.catch((e) => {
    console.log('Unexpected GET');
    return;
  })*/;
  if (!cardExists) {
    cb('Unexpected error (no such user)', null);
    return;
  }
  let terms = await prisma.term.findMany({
    where: {
      cardId: cardId
    }
  });
  if (!terms) {
    cb('No terms found', null)
    return;
  }
  console.log(terms);
  
  cb(null, terms);
  
}

export async function removeCardTerm(cardId: number, termId: number, cb: Function) {
  await prisma.term.deleteMany({
    where: {
      id: termId,
      cardId
    }
  });
}
export async function removeCard(cardId: number) {
  await prisma.term.deleteMany({
    where: {
      cardId
    }
  });
  let success = await prisma.card.delete({
    where: {
      id: cardId
    }
  });
  console.log('Card removal result :', success);
  
}

export async function updateTerm(cardId: number, termId: number, term: string, definition: string, cb: Function) {
  console.log(termId);
  if (!termId || !cardId) {
    cb('No termId | cardId were provided,', termId, cardId);
    return;
  }
  
  let termExists = prisma.term.findUnique({
    where: {
      id: termId
    }
  });
  if (!termExists) {
    cb('Unexpected error (no such term)');
    return;
  }
  let updated = await prisma.term.update({
    where: {
      id: termId
    },
    data: {
      term,
      definition
    }
  });
  console.log(updated);
  
}