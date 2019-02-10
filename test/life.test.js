const { BN, time, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const Life = artifacts.require('Life');

contract('Life', ([dead, spawner, victim, healer]) => {
  const day = 60*60*24+1;
  beforeEach(async function () {
    this.life = await Life.new();
  });

  describe('spawn', () => {
    it('fails when calling with 0 eth', async function () {
      await shouldFail.reverting(this.life.spawn({ from: spawner, value: 0 }));
    });

    it('creates a new life when calling with 1 eth', async function () {
      await this.life.spawn({ from: spawner, value: 1e18 });
      const health = await this.life.health(spawner);
      health.should.be.bignumber.equal(new BN(10));
    });

    it('burns the 1 eth', async function () {
      await this.life.spawn({ from: spawner, value: 1e18 });
      const balance = await web3.eth.getBalance(this.life.address);
      balance.should.equal('0');
    });
  })

  describe('hit', () => {
    const hitter = spawner;
    beforeEach(async function () {
      this.life = await Life.new();
      await this.life.spawn({ from: hitter, value: 1e18 });
      await this.life.spawn({ from: victim, value: 1e18 });
    });

    it('reduces health of victim', async function () {
      await this.life.hit(victim, {from: hitter});
      const health = await this.life.health(victim);
      health.should.be.bignumber.equal(new BN(9));
    });

    it('fails when called too fast', async function () {
      await this.life.hit(victim, {from: hitter});
      await shouldFail.reverting(
        this.life.hit(victim, {from: hitter})
      );
    });

    it('can be called again after a day passed', async function () {
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      const health = await this.life.health(victim);
      health.should.be.bignumber.equal(new BN(8));
    });


    it('fails after health is 0', async function () {
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      await time.increase(day);
      await shouldFail.reverting(
        this.life.hit(victim, {from: hitter})
      );
    });

    it('fails if caller is not alive', async function () {
      await shouldFail.reverting(
        this.life.hit(victim, {from: dead})
      );
    });

  })

  describe('heal', () => {
    const hitter = spawner;
    beforeEach(async function () {
      this.life = await Life.new();
      await this.life.spawn({ from: hitter, value: 1e18 });
      await this.life.spawn({ from: victim, value: 1e18 });
      await this.life.spawn({ from: healer, value: 1e18 });
      await this.life.hit(victim, {from: hitter});
    });

    it('restores health of victim', async function () {
      let health = await this.life.health(victim);
      health.should.be.bignumber.equal(new BN(9));
      await this.life.heal(victim, {from: healer});
      health = await this.life.health(victim);
      health.should.be.bignumber.equal(new BN(10));
    });

    it('fails when called too fast', async function () {
      // reduce health to 8, otherwise double heal would fail
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      
      await this.life.heal(victim, {from: healer});
      await shouldFail.reverting(
        this.life.heal(victim, {from: healer})
      );
    });

    it('can be called again after a day passed', async function () {
      // reduce health to 8, otherwise double heal would fail
      await time.increase(day);
      await this.life.hit(victim, {from: hitter});
      
      await this.life.heal(victim, {from: healer});
      await time.increase(day);
      await this.life.heal(victim, {from: healer});
      health = await this.life.health(victim);
      health.should.be.bignumber.equal(new BN(10));

    });

    it('fails if health is 10', async function () {
      await shouldFail.reverting(
        this.life.heal(hitter, {from: healer})
      );
    });

    it('fails if caller is not alive', async function () {
      await shouldFail.reverting(
        this.life.heal(victim, {from: dead})
      );
    });

  })


  describe('cooldown', () => {
    const hitter = spawner;
    beforeEach(async function () {
      this.life = await Life.new();
      await this.life.spawn({ from: hitter, value: 1e18 });
      await this.life.spawn({ from: victim, value: 1e18 });
      await this.life.spawn({ from: healer, value: 1e18 });
    });

    it('works if heals and hits on the next day', async function () {
      await this.life.hit(victim, {from: hitter})
      await time.increase(day);
      await this.life.heal(victim, {from: hitter});
      await time.increase(day);
      await this.life.hit(victim, {from: hitter})
      health = await this.life.health(victim);
      health.should.be.bignumber.equal(new BN(9));
    });

    it('works if hits and heals on the next day', async function () {
      await this.life.hit(victim, {from: hitter})
      await time.increase(day);
      await this.life.heal(victim, {from: hitter});
      health = await this.life.health(victim);
      health.should.be.bignumber.equal(new BN(10));
    });

    it('fails if hits and heals on the same day', async function () {
      await this.life.hit(victim, {from: hitter})
      await shouldFail.reverting(
        this.life.heal(victim, {from: hitter})
      );
    });

    it('fails if heals and hits on the same day', async function () {
      await this.life.hit(victim, {from: hitter})
      await time.increase(day);
      await this.life.heal(victim, {from: hitter})
      await shouldFail.reverting(
        this.life.hit(victim, {from: hitter})
      );
    });

  })

});
