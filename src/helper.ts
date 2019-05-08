import * as lua from "./ast";
import * as tags from "./tags";

export function getPreviousNode(chunk: lua.Chunk, node: lua.Node): lua.Node | undefined {
    let previousNode: lua.Node;
    for (const statement of chunk.body) {
        if (statement === node) {
            previousNode = statement;
        } else {
            // @ts-ignore
            return previousNode;
        }
    }
    return undefined;
}

export function getCommentsAsString(chunk: lua.Chunk, node: lua.Node): string {
    return getComments(chunk, node).join("\n");
}

export function getComments(chunk: lua.Chunk, node: lua.Node): lua.Comment[] {
    const previousNode = getPreviousNode(chunk, node);
    const comments: lua.Comment[] = [];
    for (const comment of chunk.comments) {
        const min = previousNode ? previousNode.range[1] : 0;
        if (comment.range[0] >= min && comment.range[1] <= node.range[0]) {
            comments.push(comment);
        }
    }
    return comments;
}

export function getTags(comments: lua.Comment[]): tags.Tags[] {
    const availableTags: tags.Tags[] = [];
    comments.forEach(comment => {
        const [, tagName, ...text] = comment.raw.split(" ");
        switch (tagName) {
            case "@param": {
                const [name, ...description] = text;
                availableTags.push(tags.createParamTag(name, description.join(" ")));
                break;
            }
            case "@tparam": {
                const [type, name, ...description] = text;
                availableTags.push(tags.createTParamTag(name, type, description.join(" ")));
                break;
            }
            case "@return": {
                const [...description] = text;
                availableTags.push(tags.createReturnTag(description.join(" ")));
                break;
            }
            case "@treturn": {
                const [type, ...description] = text;
                availableTags.push(tags.createTReturnTag(type, description.join(" ")));
                break;
            }
        }
    });
    return availableTags;
}

export function getMemberExpressionBaseIdentifier(node: lua.MemberExpression): lua.Identifier {
    let base = node.base;
    while (base.type === "MemberExpression") {
        base = base.base;
    }
    return base;
}