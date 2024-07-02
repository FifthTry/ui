function toggleMemberInList(member, list) {
    let alreadyInListIndex = list.getList().findIndex(
        obj => fastn_utils.getFlattenStaticValue(obj.item) === fastn_utils.getFlattenStaticValue(member)
    );

    if (alreadyInListIndex !== -1) {
        list.deleteAt(alreadyInListIndex);
    } else {
        list.push(member);
    }
}

function listContains(member, list) {
    return list.getList().some(
        obj => fastn_utils.getFlattenStaticValue(obj.item) === fastn_utils.getFlattenStaticValue(member)
    );
}